import "dotenv/config";

import { ChatOpenAI } from "@langchain/openai";
import { PromptTemplate } from "@langchain/core/prompts";
import { StringOutputParser } from "@langchain/core/output_parsers";
import { StateGraph, START, END } from "@langchain/langgraph";

/**
 * AI Assistant Service with LangGraph orchestration
 * - Intent detection
 * - Action routing
 * - Conversation state
 * - UI filter control
 */
class AIAssistantService {
  constructor() {
    this.llm = new ChatOpenAI({
      model: "gpt-4o-mini",
      temperature: 0.6,
    });

    this.parser = new StringOutputParser();
    this.conversationHistory = new Map(); // userId -> messages[]
    this.graph = this.buildGraph();
  }

  /* =========================
     PUBLIC ENTRY POINT
  ========================== */
 async processQuery(userId, message) {
  const history = this.conversationHistory.get(userId) || [];

  try {
    const result = await this.graph.invoke({
      userId,
      message,
      history,
      intent: null,
      reply: null,
      filterActions: null,
    });

    history.push({ role: "user", content: message });
    history.push({ role: "assistant", content: result.reply });

    if (history.length > 10) {
      history.splice(0, history.length - 10);
    }

    this.conversationHistory.set(userId, history);

    return {
      reply: result.reply,
      filterActions: result.filterActions,
    };
  } catch (err) {
    console.error("LangGraph execution failed:", err);

    // 🔒 SAFE FALLBACK (MANDATORY)
    return {
      reply:
        "I'm currently facing some issues processing requests. You can still use manual filters while I recover.",
      filterActions: null,
    };
  }
}


  /* =========================
     LANGGRAPH DEFINITION
  ========================== */
  buildGraph() {
    const graph = new StateGraph({
      channels: {
        userId: null,
        message: null,
        history: null,
        intent: null,
        reply: null,
        filterActions: null,
      },
    });

    /* -------- Nodes -------- */

    graph.addNode("detect_intent", async (state) => {
      const intent = await this.detectIntent(state.message);
      return { ...state, intent };
    });

    graph.addNode("filter_action", async (state) => {
      const filters = await this.extractFilters(state.message);
      return {
        ...state,
        filterActions: filters,
        reply: this.generateFilterResponse(filters),
      };
    });

    graph.addNode("help_action", async (state) => {
      const reply = await this.generateHelpResponse(state.message);
      return { ...state, reply, filterActions: null };
    });

    graph.addNode("chat_action", async (state) => {
      const reply = await this.generateChatResponse(
        state.message,
        state.history
      );
      return { ...state, reply, filterActions: null };
    });

    /* -------- Routing -------- */

    graph.addConditionalEdges("detect_intent", (state) => {
      if (state.intent === "FILTER_CONTROL") return "filter_action";
      if (
        state.intent === "PRODUCT_HELP" ||
        state.intent === "APPLICATION_QUERY"
      )
        return "help_action";
      return "chat_action";
    });

    graph.addEdge("filter_action", END);
    graph.addEdge("help_action", END);
    graph.addEdge("chat_action", END);

    graph.setEntryPoint("detect_intent");


    return graph.compile();
  }

  /* =========================
     INTENT DETECTION
  ========================== */
  async detectIntent(message) {
    const prompt = PromptTemplate.fromTemplate(`
Classify the user's intent. Choose ONE:

- FILTER_CONTROL
- APPLICATION_QUERY
- PRODUCT_HELP
- JOB_SEARCH
- GENERAL_CHAT

User message:
{message}

Respond with ONLY the intent.
    `);

    try {
      const chain = prompt.pipe(this.llm).pipe(this.parser);
      return (await chain.invoke({ message })).trim();
    } catch {
      return "GENERAL_CHAT";
    }
  }

  /* =========================
     FILTER EXTRACTION
  ========================== */
  async extractFilters(message) {
    const prompt = PromptTemplate.fromTemplate(`
Extract filters from the message. Return JSON only.

Fields:
- workMode: remote | hybrid | onsite | null
- jobType: full_time | part_time | contract | internship | null
- location: string | null
- matchScore: high | medium | all | null
- clear: boolean

Message:
{message}
    `);

    try {
      const chain = prompt.pipe(this.llm).pipe(this.parser);
      return JSON.parse(await chain.invoke({ message }));
    } catch {
      return {};
    }
  }

  generateFilterResponse(filters) {
    if (filters.clear) {
      return "All filters have been cleared.";
    }

    const parts = [];
    if (filters.workMode) parts.push(filters.workMode);
    if (filters.jobType) parts.push(filters.jobType.replace("_", " "));
    if (filters.location) parts.push(`in ${filters.location}`);
    if (filters.matchScore === "high") parts.push("high match score jobs");

    return parts.length
      ? `Updated filters: ${parts.join(", ")}.`
      : "I couldn't detect any filter changes.";
  }

  /* =========================
     HELP & CHAT
  ========================== */
  async generateHelpResponse(message) {
    const prompt = PromptTemplate.fromTemplate(`
You are a Job Tracker assistant.
Answer briefly and clearly.

User question:
{message}
    `);

    const chain = prompt.pipe(this.llm).pipe(this.parser);
    return await chain.invoke({ message });
  }

  async generateChatResponse(message, history) {
    const context = history
      .map((h) => `${h.role}: ${h.content}`)
      .join("\n");

    const prompt = PromptTemplate.fromTemplate(`
You are a friendly job assistant.

Conversation:
{context}

User:
{message}
    `);

    const chain = prompt.pipe(this.llm).pipe(this.parser);
    return await chain.invoke({
      context: context || "No previous conversation",
      message,
    });
  }

  clearHistory(userId) {
    this.conversationHistory.delete(userId);
  }
}

export default new AIAssistantService();

