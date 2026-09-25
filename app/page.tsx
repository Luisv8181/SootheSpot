"use client";

import { useEffect, useMemo, useState } from "react";
import { CheckIn } from "@/components/CheckIn";
import { ResourceCard } from "@/components/ResourceCard";
import { ToolCard } from "@/components/ToolCard";
import { resourceRegistry, searchResources } from "@/domain/resources/registry";
import type { Resource } from "@/domain/resources/types";
import { retrieveTools } from "@/domain/tools/retrieve";
import { seedTools } from "@/domain/tools/seed";
import type { CheckInState, Tool, ToolFeedback } from "@/domain/tools/types";

type Tab = "home" | "tools" | "resources" | "profile";

const stateCopy: Record<CheckInState, string> = {
  okay: "You seem okay right now. Keep something useful close anyway.",
  off: "Let's find something small that might shift the moment.",
  overwhelmed: "Let's lower the pressure. You don't need to solve everything right now.",
  anxious: "Let's give your attention somewhere steady to land.",
  sad: "Let's make the next few minutes a little gentler.",
  angry: "Let's create a little space before deciding what comes next.",
  support: "You can use your tools, or move to the support pathway if you need more than a coping tool."
};

export default function Home() {
  const [tab, setTab] = useState<Tab>("home");
  const [state, setState] = useState<CheckInState | null>(null);
  const [language, setLanguage] = useState("en");
  const [savedIds, setSavedIds] = useState<string[]>([]);
  const [feedback, setFeedback] = useState<ToolFeedback[]>([]);
  const [savedResources, setSavedResources] = useState<Resource[]>([]);
  const [activeTool, setActiveTool] = useState<Tool | null>(null);
  const [resourceQuery, setResourceQuery] = useState("");

  useEffect(() => {
    try {
      setSavedIds(JSON.parse(localStorage.getItem("soothespot.savedToolIds") ?? "[]"));
      setFeedback(JSON.parse(localStorage.getItem("soothespot.feedback") ?? "[]"));
      setSavedResources(JSON.parse(localStorage.getItem("soothespot.savedResources") ?? "[]"));
    } catch {
      // Keep the app usable when local storage is unavailable or malformed.
    }
  }, []);

  const helpfulToolIds = useMemo(
    () => feedback.filter((item) => item.helpfulness === "a-lot").map((item) => item.toolId),
    [feedback]
  );

  const recommendations = useMemo(() => {
    if (!state) return [];
    return retrieveTools(seedTools, {
      state,
      language,
      helpfulToolIds
    });
  }, [state, language, helpfulToolIds]);

  const savedTools = seedTools.filter((tool) => savedIds.includes(tool.id));
  const resources = searchResources(resourceQuery, language === "es" ? "Spanish" : "English");

  function saveTool(tool: Tool) {
    const next = Array.from(new Set([...savedIds, tool.id]));
    setSavedIds(next);
    localStorage.setItem("soothespot.savedToolIds", JSON.stringify(next));
  }

  function saveResource(resource: Resource) {
    const next = [...savedResources.filter((item) => item.id !== resource.id), resource];
    setSavedResources(next);
    localStorage.setItem("soothespot.savedResources", JSON.stringify(next));
  }

  function giveFeedback(value: ToolFeedback["helpfulness"]) {
    if (!activeTool) return;
    const next = [...feedback, {
      toolId: activeTool.id,
      helpfulness: value,
      createdAt: new Date().toISOString()
    }];
    setFeedback(next);
    localStorage.setItem("soothespot.feedback", JSON.stringify(next));
    setActiveTool(null);
  }

  return (
    <main className="app-shell">
      <header className="topbar">
        <div className="brand">
          <span className="brand-mark" aria-hidden="true">S</span>
          <span className="brand-name">SootheSpot</span>
        </div>
        <button
          className="language-toggle"
          onClick={() => setLanguage(language === "en" ? "es" : "en")}
          aria-label="Change language"
        >
          {language === "en" ? "ES" : "EN"}
        </button>
      </header>

      <div className="content">
        {tab === "home" && (
          <>
            <section className="hero">
              <p className="eyebrow">Your tools. Your space. A calmer you.</p>
              <h1>How are you right now?</h1>
              <p className="hero-copy">
                Tell SootheSpot in your own words, your language, and your context.
              </p>
              <CheckIn value={state} onChange={setState} />
            </section>

            {state && (
              <section className="recommendation-section">
                <div className="section-heading">
                  <div>
                    <p className="eyebrow">For this moment</p>
                    <h2>{stateCopy[state]}</h2>
                  </div>
                  <span className="context-pill">
                    {language === "en" ? "English" : "Español"} · personal
                  </span>
                </div>

                {state === "support" ? (
                  <div className="safety-card">
                    <strong>Need more than a coping tool?</strong>
                    <p>
                      If you are in immediate danger or think you may hurt yourself or someone else,
                      use local emergency or crisis support. SootheSpot does not assess emergencies.
                    </p>
                    <button onClick={() => setTab("profile")}>Open safety boundary</button>
                  </div>
                ) : (
                  <div className="tool-list">
                    {recommendations.map(({ tool, reason }) => (
                      <ToolCard key={tool.id} tool={tool} reason={reason} onOpen={setActiveTool} />
                    ))}
                  </div>
                )}
              </section>
            )}

            <section className="quick-section">
              <button className="quick-card" onClick={() => setTab("tools")}>
                <span>My Toolbox</span>
                <small>{savedTools.length + savedResources.length} saved</small>
              </button>
              <button className="quick-card" onClick={() => setTab("resources")}>
                <span>Explore Resources</span>
                <small>{resourceRegistry.length} curated now</small>
              </button>
            </section>
          </>
        )}

        {tab === "tools" && (
          <section className="page-section">
            <p className="eyebrow">Personal Toolbox</p>
            <h1>The things that help you.</h1>
            <p className="hero-copy">
              Your saved tools stay yours. SootheSpot keeps provenance visible.
            </p>

            <div className="tool-list">
              {savedTools.map((tool) => (
                <ToolCard key={tool.id} tool={tool} onOpen={setActiveTool} />
              ))}
              {savedResources.map((resource) => (
                <div className="saved-resource-row" key={resource.id}>
                  <div>
                    <strong>{resource.name}</strong>
                    <span>{resource.publisher}</span>
                  </div>
                  <a href={resource.official_url} target="_blank" rel="noreferrer">Open</a>
                </div>
              ))}
            </div>

            {!savedTools.length && !savedResources.length && (
              <div className="empty-state">
                Save something from your recommendations or the Resource Explorer and it will appear here.
              </div>
            )}
          </section>
        )}

        {tab === "resources" && (
          <section className="page-section">
            <p className="eyebrow">Resource Library</p>
            <h1>Real tools from around the world.</h1>
            <p className="hero-copy">
              SootheSpot organizes resources. It does not pretend to own them.
            </p>
            <input
              className="search-input"
              value={resourceQuery}
              onChange={(event) => setResourceQuery(event.target.value)}
              placeholder="Search breathing, anxiety, sleep..."
              aria-label="Search resources"
            />
            <div className="resource-list">
              {resources.map((resource) => (
                <ResourceCard key={resource.id} resource={resource} onSave={saveResource} />
              ))}
            </div>
          </section>
        )}

        {tab === "profile" && (
          <section className="page-section">
            <p className="eyebrow">You</p>
            <h1>Context. Culture. Privacy. Agency.</h1>

            <div className="principles">
              <article>
                <strong>Context</strong>
                <p>Recommendations use the situation you choose to share, not a diagnosis.</p>
              </article>
              <article>
                <strong>Culture</strong>
                <p>Language, culture, region, and identity are separate concepts. SootheSpot should never stereotype.</p>
              </article>
              <article>
                <strong>Privacy</strong>
                <p>This prototype stores saved tools and feedback in your browser. No AI provider receives your data.</p>
              </article>
              <article>
                <strong>Agency</strong>
                <p>You decide what gets saved, shared, personalized, or generated.</p>
              </article>
            </div>

            <div className="safety-card">
              <strong>Safety boundary</strong>
              <p>
                SootheSpot is for everyday emotional regulation. It is not an emergency service,
                crisis assessor, or replacement for professional care.
              </p>
            </div>
          </section>
        )}
      </div>

      <nav className="bottom-nav" aria-label="Primary navigation">
        <button className={tab === "home" ? "active" : ""} onClick={() => setTab("home")}>Home</button>
        <button className={tab === "tools" ? "active" : ""} onClick={() => setTab("tools")}>Tools</button>
        <button className={tab === "resources" ? "active" : ""} onClick={() => setTab("resources")}>Resources</button>
        <button className={tab === "profile" ? "active" : ""} onClick={() => setTab("profile")}>You</button>
      </nav>

      {activeTool && (
        <div className="modal-backdrop" role="dialog" aria-modal="true" aria-labelledby="tool-title">
          <div className="modal">
            <button className="close-button" onClick={() => setActiveTool(null)} aria-label="Close">×</button>
            <p className="eyebrow">{activeTool.category}</p>
            <h2 id="tool-title">{activeTool.title}</h2>
            <p>{activeTool.description}</p>

            <ol className="instruction-list">
              {activeTool.instructions.map((instruction) => (
                <li key={instruction}>{instruction}</li>
              ))}
            </ol>

            <button className="primary-button" onClick={() => saveTool(activeTool)}>
              Save to My Toolbox
            </button>

            <div className="feedback">
              <p>Did this help?</p>
              <div>
                <button onClick={() => giveFeedback("a-lot")}>A lot</button>
                <button onClick={() => giveFeedback("a-little")}>A little</button>
                <button onClick={() => giveFeedback("not-really")}>Not really</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
