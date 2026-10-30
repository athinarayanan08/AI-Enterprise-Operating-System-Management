# TaskFlow AI
### An Agentic Generative AI Assistant for Autonomous Multi-Step Task Execution

**Final Year Project Synopsis**

Submitted in partial fulfilment of the requirements for the award of
**Bachelor's Degree in Computer Science / Information Technology**

- Name: [Your Name]
- Register / Roll Number: [Your Roll Number]
- Department: [Department Name]
- College / University: [College Name]
- Year: 2026


## 1. Abstract

Conventional AI chatbots are limited to answering questions within a single conversational turn and cannot independently carry out multi-step real-world tasks. This project proposes **TaskFlow AI**, an agentic Generative AI assistant capable of understanding a high-level natural-language goal, autonomously breaking it into a sequence of sub-tasks, invoking external tools and APIs to execute each sub-task, and reporting the outcome back to the user in natural language.

Unlike a traditional retrieval or Q&A chatbot, TaskFlow AI reasons about what needs to be done, plans the order of operations, executes actions using a defined toolset (such as calendar scheduling, reminders, web search, and email drafting), and adapts its plan if a step fails. The system is built using a Large Language Model (LLM) with function-calling capability, a task-planning module, and a small set of integrated tools, and is evaluated on task-completion accuracy, planning correctness, and execution reliability.

The project demonstrates a practical, scoped implementation of agentic AI — one of the most significant current directions in applied Generative AI — while remaining achievable as a solo final-year submission.

---

## 2. Introduction

Generative AI has moved rapidly from simple text generation to systems that can plan and act. Most existing student and commercial chatbots are purely conversational: they respond to a query but cannot carry out actions on the user's behalf. An "agentic" AI assistant closes this gap by combining an LLM's reasoning ability with the capacity to call external tools, chain multiple steps together, and pursue a goal with minimal supervision.

This project builds a scoped, demonstrable version of such a system, focused on everyday personal productivity tasks, so that its behaviour can be clearly explained, tested, and evaluated within an academic setting.

---

## 3. Problem Statement

Existing AI assistants largely operate in a single request-response pattern and require the user to manually perform every step of a multi-part task themselves, even when the instructions are clear. There is a need for an assistant that can:

- Interpret a compound instruction
- Decompose it into an ordered plan
- Execute each part using the appropriate tool
- Handle intermediate failures gracefully
- Summarise the final outcome

...all with minimal manual intervention from the user.

---

## 4. Objectives

- To design a conversational interface that accepts natural-language, multi-step user goals.
- To build a task-planning module that decomposes a goal into an ordered sequence of executable sub-tasks.
- To integrate a small set of real tools (reminders, calendar entries, web search, email drafts) that the agent can invoke via function calling.
- To implement basic error handling and re-planning when a sub-task fails or returns unexpected results.
- To generate a clear, natural-language summary of what the agent did at the end of each session.
- To evaluate the system on task-completion accuracy and planning correctness.

---

## 5. Core Features (Scoped for Solo, 2–3 Months)

| # | Feature | Description |
|---|---------|--------------|
| 1 | Natural-language goal input | User types or speaks a compound instruction, e.g. "Remind me to call the supplier tomorrow at 10am and draft a follow-up email." |
| 2 | Task planner | LLM decomposes the goal into an ordered list of sub-tasks with the tool required for each. |
| 3 | Tool execution layer | Agent calls the relevant tool (reminder, calendar, search, email-draft) for each sub-task via function calling. |
| 4 | Failure handling / re-planning | If a step fails or returns an unexpected result, the agent revises the remaining plan instead of stopping outright. |
| 5 | Execution summary | At the end of the run, the agent generates a plain-language summary of what was completed and what needs the user's attention. |
| 6 | Session log / transparency view | A simple UI panel showing the plan, each tool call, and its result, so the user can see how the agent reached its outcome. |

---

## 6. System Architecture (High-Level)

```
User Goal (Text/Voice)
        ↓
Intent & Goal Parser (LLM)
        ↓
Task Planner (breaks goal into ordered sub-tasks)
        ↓
Tool Router
        ↓
Tool Execution Layer
   (Reminder API, Calendar API, Web Search, Email Draft Generator)
        ↓
Result Aggregator
        ↓
LLM Summary Generator
        ↓
Response to User (Text/Voice) + Session Log
```

A lightweight local database stores session history, plan state, and tool results so the agent can reference earlier steps within the same task and support the transparency view.

---

## 7. Technology Stack

| Layer | Tool / Technology |
|-------|--------------------|
| LLM (planning + generation) | OpenAI GPT API with function calling, or open-source Llama 3 / Mistral via Ollama |
| Task planning | LLM-based planner using structured (JSON) function-calling output |
| Tool integrations | Mock/lightweight APIs for reminders, calendar, web search (e.g. SerpAPI), email drafting |
| Speech (optional) | Whisper for speech-to-text, gTTS for text-to-speech |
| Backend | Python + FastAPI |
| Frontend | Streamlit or a lightweight React interface |
| Database | SQLite for session/plan/tool-result storage |

---

## 8. Project Timeline (10 Weeks)

| Weeks | Task |
|-------|------|
| 1–2 | Literature review on agentic AI/function calling; finalize scope; environment setup |
| 3–4 | Build the goal parser and task planner (LLM → structured sub-task list) |
| 5–6 | Implement tool execution layer and integrate 3–4 real/mock tools |
| 7 | Add failure handling and re-planning logic |
| 8 | Build execution summary generator and session log |
| 9 | Build UI (chat + transparency panel), connect all components |
| 10 | Testing, evaluation, report writing, and demo preparation |

---

## 9. Evaluation Metrics

- **Task-completion rate**: percentage of test goals fully and correctly executed end-to-end.
- **Planning correctness**: percentage of generated plans that are logically ordered and complete for the given goal.
- **Tool-call accuracy**: percentage of tool invocations with correctly extracted parameters.
- **Recovery rate**: percentage of injected step-failures the agent successfully re-plans around.
- **Average response/execution time** per task.

---

## 10. Future Scope

| Now (Current Scope) | Future Direction |
|----------------------|-------------------|
| 3–4 built-in tools | Plug-in architecture supporting any number of third-party tools/APIs |
| Single-agent planner | Multi-agent collaboration (specialized planner, executor, and reviewer agents) |
| Session-only memory | Long-term personalized memory across sessions and devices |
| Text/voice chat UI | Integration into WhatsApp, browser extension, or OS-level assistant |
| Manual tool approval | Configurable autonomy levels, from full user approval to fully autonomous execution |
| Single-user, local | Multi-user, cloud-synced deployment with authentication |

While the current implementation is scoped to a small set of personal-productivity tools, the underlying planner–executor architecture is designed to generalize: additional tools can be registered without redesigning the planning logic, allowing the same core system to grow into a broader autonomous assistant platform.

---

## 11. Conclusion

TaskFlow AI demonstrates a scoped but genuine implementation of agentic Generative AI — an assistant that reasons about a goal, plans a sequence of actions, executes them using real tools, and reports back in natural language. By focusing on a small, well-defined toolset and clear evaluation metrics, the project remains achievable within a solo, 2–3 month final-year timeline while showcasing a technically current and forward-looking direction in applied AI.

---

## 12. References

*(Add relevant papers/documentation here — e.g., OpenAI function calling docs, LangChain/agent framework docs, and any agentic AI research papers you cite.)*