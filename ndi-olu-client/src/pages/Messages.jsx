import { useEffect, useState } from "react";
import { Send } from "lucide-react";
import { useSearchParams } from "react-router-dom";
import DashboardLayout from "../components/layout/DashboardLayout";
import { useAuth } from "../context/AuthContext";

function Messages() {
  const { token, user } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  const [conversations, setConversations] = useState([]);
  const [messages, setMessages] = useState([]);
  const [job, setJob] = useState(null);
  const [body, setBody] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const jobId = searchParams.get("jobId");

  useEffect(() => {
    async function loadConversations() {
      try {
        const response = await fetch(`${import.meta.env.VITE_API_URL}/api/messages/conversations`, { headers: { Authorization: `Bearer ${token}` } });
        const data = await response.json();
        if (!response.ok) throw new Error(data.message || "Unable to load conversations.");
        setConversations(data.conversations || []);
      } catch (loadError) {
        setError(loadError.message);
      } finally {
        setLoading(false);
      }
    }
    if (token) loadConversations();
  }, [token]);

  useEffect(() => {
    async function loadMessages() {
      if (!jobId || !token) {
        setMessages([]);
        setJob(null);
        return;
      }
      try {
        const response = await fetch(`${import.meta.env.VITE_API_URL}/api/messages/jobs/${jobId}`, { headers: { Authorization: `Bearer ${token}` } });
        const data = await response.json();
        if (!response.ok) throw new Error(data.message || "Unable to load this conversation.");
        setMessages(data.messages || []);
        setJob(data.job);
      } catch (loadError) {
        setError(loadError.message);
      }
    }
    loadMessages();
  }, [jobId, token]);

  async function sendMessage(event) {
    event.preventDefault();
    if (!body.trim()) return;
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/messages/jobs/${jobId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ body }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || "Unable to send your message.");
      setMessages((current) => [...current, data.message]);
      setBody("");
      setConversations((current) => current.map((conversation) => conversation.job_id === jobId ? { ...conversation, latest_message: data.message.body, latest_message_at: data.message.created_at } : conversation));
    } catch (sendError) {
      setError(sendError.message);
    }
  }

  return (
    <DashboardLayout>
      <section>
        <p className="text-sm font-semibold text-ndi-orange">MESSAGES</p>
        <h1 className="mt-1 text-3xl font-extrabold tracking-tight text-slate-950">Job conversations</h1>
        <p className="mt-2 text-sm leading-6 text-slate-500">Discuss an accepted job directly with the {user?.role === "worker" ? "customer" : "selected worker"}.</p>
      </section>
      {error && <p className="mt-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">{error}</p>}
      <section className="mt-8 grid min-h-[560px] overflow-hidden rounded-2xl border border-slate-200 bg-white lg:grid-cols-[320px_1fr]">
        <aside className="border-b border-slate-200 lg:border-b-0 lg:border-r">
          <div className="border-b border-slate-100 p-5"><h2 className="font-extrabold text-slate-950">Conversations</h2></div>
          {loading ? <p className="p-5 text-sm text-slate-500">Loading conversations...</p> : conversations.length ? conversations.map((conversation) => (
            <button key={conversation.job_id} type="button" onClick={() => setSearchParams({ jobId: conversation.job_id })} className={`w-full border-b border-slate-100 p-5 text-left transition hover:bg-slate-50 ${jobId === conversation.job_id ? "bg-emerald-50" : ""}`}>
              <p className="font-bold text-slate-900">{conversation.other_person_name}</p>
              <p className="mt-1 truncate text-sm font-semibold text-ndi-forest">{conversation.title}</p>
              <p className="mt-2 truncate text-xs text-slate-500">{conversation.latest_message || "No messages yet"}</p>
            </button>
          )) : <p className="p-5 text-sm leading-6 text-slate-500">Your accepted jobs will appear here.</p>}
        </aside>
        <div className="flex min-h-[420px] flex-col">
          {job ? <>
            <div className="border-b border-slate-100 p-5"><p className="font-extrabold text-slate-950">{job.title}</p><p className="mt-1 text-sm text-slate-500">{user?.role === "worker" ? job.customer_name : job.worker_name}</p></div>
            <div className="flex-1 space-y-4 overflow-y-auto bg-slate-50 p-5">
              {messages.length ? messages.map((message) => {
                const mine = message.sender_id === user?.id;
                return <div key={message.id} className={`flex ${mine ? "justify-end" : "justify-start"}`}><div className={`max-w-[80%] rounded-2xl px-4 py-3 text-sm leading-6 ${mine ? "bg-ndi-forest text-white" : "bg-white text-slate-700 shadow-sm"}`}><p>{message.body}</p><p className={`mt-1 text-[11px] ${mine ? "text-emerald-100" : "text-slate-400"}`}>{mine ? "You" : message.sender_name}</p></div></div>;
              }) : <p className="py-10 text-center text-sm text-slate-500">Start the conversation about this job.</p>}
            </div>
            <form onSubmit={sendMessage} className="flex gap-3 border-t border-slate-100 p-4"><input value={body} onChange={(event) => setBody(event.target.value)} maxLength="2000" placeholder="Write a message..." className="h-12 min-w-0 flex-1 rounded-xl border border-slate-200 px-4 text-sm outline-none focus:border-ndi-forest focus:ring-2 focus:ring-emerald-100" /><button type="submit" className="inline-flex h-12 items-center gap-2 rounded-xl bg-ndi-forest px-4 text-sm font-bold text-white hover:bg-ndi-forest-dark"><Send size={17} />Send</button></form>
          </> : <div className="flex flex-1 items-center justify-center p-8 text-center text-sm text-slate-500">Choose a conversation to view messages.</div>}
        </div>
      </section>
    </DashboardLayout>
  );
}

export default Messages;
