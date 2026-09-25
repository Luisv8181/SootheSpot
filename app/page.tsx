"use client";

import { useEffect, useMemo, useState } from "react";
import { CheckIn } from "@/components/CheckIn";
import { stateCopy, uiCopy, type Language } from "@/domain/i18n/copy";
import { localizeTool } from "@/domain/i18n/tools";
import { ToolCreator } from "@/components/ToolCreator";
import { ResourceCard } from "@/components/ResourceCard";
import { ToolCard } from "@/components/ToolCard";
import { resourceRegistry, searchResources } from "@/domain/resources/registry";
import type { Resource } from "@/domain/resources/types";
import { historyLabel, summarizeToolFeedback } from "@/domain/tools/history";
import { retrieveTools } from "@/domain/tools/retrieve";
import { seedTools } from "@/domain/tools/seed";
import type { CheckInState, Tool, ToolFeedback } from "@/domain/tools/types";
import { worlds } from "@/domain/worlds/seed";
import type { World } from "@/domain/worlds/types";
import { WorldExperience } from "@/components/WorldExperience";

type Tab = "home" | "tools" | "resources" | "worlds" | "profile";

export default function Home() {
  const [tab, setTab] = useState<Tab>("home");
  const [state, setState] = useState<CheckInState | null>(null);
  const [language, setLanguage] = useState<Language>("en");
  const [availableMinutes, setAvailableMinutes] = useState<number | undefined>(5);
  const [savedIds, setSavedIds] = useState<string[]>([]);
  const [feedback, setFeedback] = useState<ToolFeedback[]>([]);
  const [savedResources, setSavedResources] = useState<Resource[]>([]);
  const [customTools, setCustomTools] = useState<Tool[]>([]);
  const [showToolCreator, setShowToolCreator] = useState(false);
  const [toolQuery, setToolQuery] = useState("");
  const [activeTool, setActiveTool] = useState<Tool | null>(null);
  const [resourceQuery, setResourceQuery] = useState("");
  const [activeWorld, setActiveWorld] = useState<World | null>(null);

  useEffect(() => {
    try {
      setSavedIds(JSON.parse(localStorage.getItem("soothespot.savedToolIds") ?? "[]"));
      setFeedback(JSON.parse(localStorage.getItem("soothespot.feedback") ?? "[]"));
      setSavedResources(JSON.parse(localStorage.getItem("soothespot.savedResources") ?? "[]"));
      setCustomTools(JSON.parse(localStorage.getItem("soothespot.customTools") ?? "[]"));
    } catch {
      // Keep the app usable when local storage is unavailable or malformed.
    }
  }, []);

  const allTools = [...seedTools, ...customTools];
  const t = uiCopy[language];

  const recommendations = useMemo(() => {
    if (!state) return [];
    return retrieveTools(allTools, {
      state,
      language,
      feedback,
      availableMinutes
    });
  }, [state, language, feedback, availableMinutes, allTools]);
  const historyInsights = useMemo(
    () =>
      allTools
        .map((tool) => ({ tool, summary: summarizeToolFeedback(feedback, tool.id) }))
        .filter(({ summary }) => summary.total > 0)
        .sort((a, b) => b.summary.total - a.summary.total || b.summary.score - a.summary.score)
        .slice(0, 3),
    [allTools, feedback]
  );

  const savedTools = allTools.filter((tool) => savedIds.includes(tool.id));
  const visibleSavedTools = savedTools.filter((tool) => {
    const q = toolQuery.trim().toLowerCase();
    return !q || [tool.title, tool.description, tool.category].join(" ").toLowerCase().includes(q);
  });
  const resources = searchResources(resourceQuery, language === "es" ? "Spanish" : "English");

  function addCustomTool(tool: Tool) {
    const next = [...customTools, tool];
    setCustomTools(next);
    localStorage.setItem("soothespot.customTools", JSON.stringify(next));
    const nextSaved = Array.from(new Set([...savedIds, tool.id]));
    setSavedIds(nextSaved);
    localStorage.setItem("soothespot.savedToolIds", JSON.stringify(nextSaved));
    setShowToolCreator(false);
  }

  function deleteCustomTool(toolId: string) {
    const next = customTools.filter((tool) => tool.id !== toolId);
    setCustomTools(next);
    setSavedIds((current) => {
      const updated = current.filter((id) => id !== toolId);
      localStorage.setItem("soothespot.savedToolIds", JSON.stringify(updated));
      return updated;
    });
    localStorage.setItem("soothespot.customTools", JSON.stringify(next));
  }

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
      createdAt: new Date().toISOString(),
      checkInState: state ?? undefined
    }];
    setFeedback(next);
    localStorage.setItem("soothespot.feedback", JSON.stringify(next));
    setActiveTool(null);
  }

  function clearDemoData() {
    [
      "soothespot.savedToolIds",
      "soothespot.feedback",
      "soothespot.savedResources",
      "soothespot.customTools"
    ].forEach((key) => localStorage.removeItem(key));
    setSavedIds([]);
    setFeedback([]);
    setSavedResources([]);
    setCustomTools([]);
    setState(null);
    setActiveTool(null);
  }

  function feedbackLabel(toolId: string) {
    const summary = summarizeToolFeedback(feedback, toolId);
    if (summary.total === 0) return null;
    if (language === "en") return historyLabel(summary);
    const helpful = summary.aLot + summary.aLittle;
    return `Usada ${summary.total} ${summary.total === 1 ? "vez" : "veces"} · ${helpful} ${helpful === 1 ? "marcada como útil" : "marcadas como útiles"}`;
  }

  function recommendationReason(reason: string) {
    if (language === "en") return reason;
    if (reason.startsWith("You've marked")) return "La marcaste como útil antes en un momento parecido.";
    if (reason.startsWith("One of your own")) return "Una de tus propias herramientas que coincide con cómo te sientes.";
    if (reason.startsWith("Matches")) return "Coincide con cómo dijiste que te sientes.";
    return "Encaja con tu experiencia anterior.";
  }

  return (
    <main className="app-shell">
      <header className="topbar">
        <div className="brand">
          <span className="brand-mark" aria-hidden="true">S</span>
          <span className="brand-name">SootheSpot</span>
        </div>
        <span className="demo-badge" aria-label="Demo mode">{t.demo}</span>
        <button
          className="language-toggle"
          onClick={() => setLanguage(language === "en" ? "es" : "en")}
          aria-label={t.languageLabel}
        >
          {language === "en" ? "ES" : "EN"}
        </button>
      </header>

      <div className="content">
        {tab === "home" && (
          <>
            <section className="hero">
              <p className="eyebrow">{t.tagline}</p>
              <h1>{t.howAreYou}</h1>
              <p className="hero-copy">{t.intro}</p>
              <CheckIn value={state} onChange={setState} language={language} />

              {state && state !== "support" && (
                <div className="moment-context" aria-label={language === "en" ? "Available time" : "Tiempo disponible"}>
                  <span className="moment-context-label">
                    {language === "en" ? "I have about" : "Tengo aproximadamente"}
                  </span>
                  <div className="segmented-control">
                    {[2, 5, 10, 20].map((minutes) => (
                      <button
                        key={minutes}
                        className={availableMinutes === minutes ? "selected" : ""}
                        onClick={() => setAvailableMinutes(minutes)}
                        aria-pressed={availableMinutes === minutes}
                      >
                        {minutes} min
                      </button>
                    ))}
                    <button
                      className={availableMinutes === undefined ? "selected" : ""}
                      onClick={() => setAvailableMinutes(undefined)}
                      aria-pressed={availableMinutes === undefined}
                    >
                      {language === "en" ? "Any" : "Cualquiera"}
                    </button>
                  </div>
                </div>
              )}
            </section>

            {state && (
              <section className="recommendation-section">
                <div className="section-heading">
                  <div>
                    <p className="eyebrow">{t.forThisMoment}</p>
                    <h2>{stateCopy[language][state]}</h2>
                  </div>
                  <span className="context-pill">
                    {language === "en" ? "English" : "Español"} · personal
                  </span>
                </div>

                {state === "support" ? (
                  <div className="safety-card">
                    <strong>{t.supportTitle}</strong>
                    <p>{t.supportBody}</p>
                    <div className="resource-actions">
                      <button onClick={() => setTab("tools")}>{t.useToolbox}</button>
                      <button onClick={() => setTab("profile")}>{t.supportOptions}</button>
                    </div>
                  </div>
                ) : (
                  <div className="tool-list">
                    {recommendations.map(({ tool, reason }) => (
                      <ToolCard
                        key={tool.id}
                        tool={localizeTool(tool, language)}
                        reason={recommendationReason(reason)}
                        onOpen={setActiveTool}
                        language={language}
                      />
                    ))}
                  </div>
                )}
              </section>
            )}

            <section className="featured-world">
              <div>
                <p className="eyebrow">{language === "en" ? "A few quiet minutes" : "Unos minutos de calma"}</p>
                <h2>{language === "en" ? "Nothing to solve right now." : "No hay nada que resolver ahora mismo."}</h2>
                <p>{language === "en" ? "Try a simple breathing experience and let your attention settle." : "Prueba una experiencia sencilla de respiración y deja que tu atención se asiente."}</p>
              </div>
              <button className="featured-world-button" onClick={() => setActiveWorld(worlds[0])}>{language === "en" ? "Open Ocean Calm" : "Abrir Ocean Calm"}</button>
            </section>

            <section className="quick-section">
              <button className="quick-card" onClick={() => setTab("tools")}>
                <span>{t.toolbox}</span>
                <small>{savedTools.length + savedResources.length} saved</small>
              </button>
              <button className="quick-card" onClick={() => setTab("resources")}>
                <span>{t.exploreResources}</span>
                <small>{resourceRegistry.length} curated now</small>
              </button>
              <button className="quick-card" onClick={() => setTab("worlds")}>
                <span>{t.experiences}</span>
                <small>{worlds.length} interactive worlds</small>
              </button>
            </section>
          </>
        )}

        {tab === "tools" && (
          <section className="page-section">
            <p className="eyebrow">{t.personalToolbox}</p>
            <h1>{t.thingsHelp}</h1>
            <p className="hero-copy">{t.toolboxCopy}</p>

            {historyInsights.length > 0 && (
              <section className="insight-card">
                <div className="insight-header">
                  <div>
                    <p className="eyebrow">{language === "en" ? "Your patterns" : "Tus patrones"}</p>
                    <h2>{language === "en" ? "What SootheSpot is learning" : "Lo que SootheSpot está aprendiendo"}</h2>
                  </div>
                  <span className="insight-privacy">{language === "en" ? "From your feedback only" : "Solo de tus comentarios"}</span>
                </div>
                <div className="insight-list">
                  {historyInsights.map(({ tool, summary }) => {
                    const helpful = summary.aLot + summary.aLittle;
                    return (
                      <div className="insight-row" key={tool.id}>
                        <div>
                          <strong>{localizeTool(tool, language).title}</strong>
                          <span>
                            {language === "en"
                              ? `${summary.total} ${summary.total === 1 ? "use" : "uses"} · ${helpful} helpful`
                              : `${summary.total} ${summary.total === 1 ? "uso" : "usos"} · ${helpful} útiles`}
                          </span>
                        </div>
                        <span className={summary.score > 0 ? "insight-trend positive" : summary.score < 0 ? "insight-trend negative" : "insight-trend"}>
                          {summary.score > 0 ? "↑" : summary.score < 0 ? "↓" : "—"}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </section>
            )}

            <div className="toolbox-actions">
              <button className="primary-button compact-button" onClick={() => setShowToolCreator(true)}>{t.createTool}</button>
              <input
                className="search-input toolbox-search"
                value={toolQuery}
                onChange={(event) => setToolQuery(event.target.value)}
                placeholder={t.searchToolbox}
                aria-label={t.searchToolbox}
              />
            </div>

            <div className="tool-list">
              {visibleSavedTools.map((tool) => (
                <div key={tool.id} className="saved-tool-wrap">
                  <ToolCard tool={localizeTool(tool, language)} onOpen={setActiveTool} language={language} />
                  {feedbackLabel(tool.id) && <span className="tool-reason">{feedbackLabel(tool.id)}</span>}
                  {tool.provenance === "client-created" && tool.id.startsWith("custom-") && (
                    <button className="delete-tool-button" onClick={() => deleteCustomTool(tool.id)}>Delete</button>
                  )}
                </div>
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

            {!visibleSavedTools.length && !savedResources.length && (
              <div className="empty-state">
                Save something from your recommendations or the Resource Explorer and it will appear here.
              </div>
            )}
          </section>
        )}

        {tab === "resources" && (
          <section className="page-section">
            <p className="eyebrow">{t.resourceLibrary}</p>
            <h1>{t.resourceTitle}</h1>
            <p className="hero-copy">{t.resourceCopy}</p>
            <input
              className="search-input"
              value={resourceQuery}
              onChange={(event) => setResourceQuery(event.target.value)}
              placeholder={t.searchResources}
              aria-label={t.searchResources}
            />
            <div className="resource-list">
              {resources.map((resource) => (
                <ResourceCard key={resource.id} resource={resource} onSave={saveResource} language={language} />
              ))}
            </div>
          </section>
        )}

        {tab === "worlds" && (
          <section className="page-section">
            <p className="eyebrow">{t.experiences}</p>
            <h1>{t.worldsTitle}</h1>
            <p className="hero-copy">{t.worldsCopy}</p>

            <div className="world-grid">
              {worlds.map((world) => (
                <button key={world.id} className={`world-card world-card-${world.id}`} onClick={() => setActiveWorld(world)}>
                  <span className="world-card-art" aria-hidden="true">
                    <span />
                  </span>
                  <span className="world-card-copy">
                    <strong>{world.title}</strong>
                    <small>{world.description}</small>
                    <em>{world.durationMinutes} min · {world.category}</em>
                  </span>
                </button>
              ))}
            </div>
          </section>
        )}

        {tab === "profile" && (
          <section className="page-section">
            <p className="eyebrow">{t.you}</p>
            <h1>{t.youTitle}</h1>

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
              <strong>{t.safetyBoundary}</strong>
              <p>
                {language === "en"
                  ? "SootheSpot is for everyday emotional regulation. Needing support does not automatically mean an emergency. You can use your toolbox, reach out to someone you trust or a professional, or use local emergency/crisis support when there is immediate danger."
                  : "SootheSpot es para la regulación emocional cotidiana. Necesitar apoyo no significa automáticamente que sea una emergencia. Puedes usar tu caja de herramientas, contactar a alguien de confianza o a un profesional, o recurrir a servicios locales de emergencia/crisis cuando exista un peligro inmediato."}
              </p>
            </div>

            <div className="resource-card">
              <strong>{t.clearData}</strong>
              <p>{t.clearDataCopy}</p>
              <button className="primary-button" onClick={clearDemoData}>{t.clearData}</button>
            </div>
          </section>
        )}
      </div>

      <nav className="bottom-nav" aria-label="Primary navigation">
        <button aria-current={tab === "home" ? "page" : undefined} className={tab === "home" ? "active" : ""} onClick={() => setTab("home")}><span aria-hidden="true">⌂</span>{t.home}</button>
        <button aria-current={tab === "tools" ? "page" : undefined} className={tab === "tools" ? "active" : ""} onClick={() => setTab("tools")}><span aria-hidden="true">✦</span>{t.tools}</button>
        <button aria-current={tab === "resources" ? "page" : undefined} className={tab === "resources" ? "active" : ""} onClick={() => setTab("resources")}><span aria-hidden="true">◎</span>{t.resources}</button>
        <button aria-current={tab === "worlds" ? "page" : undefined} className={tab === "worlds" ? "active" : ""} onClick={() => setTab("worlds")}><span aria-hidden="true">◌</span>{t.worlds}</button>
        <button aria-current={tab === "profile" ? "page" : undefined} className={tab === "profile" ? "active" : ""} onClick={() => setTab("profile")}><span aria-hidden="true">○</span>{t.you}</button>
      </nav>

      {showToolCreator && <ToolCreator onCreate={addCustomTool} onClose={() => setShowToolCreator(false)} language={language} />}

      {activeWorld && <WorldExperience world={activeWorld} onClose={() => setActiveWorld(null)} language={language} />}

      {activeTool && (
        <div className="modal-backdrop" role="dialog" aria-modal="true" aria-labelledby="tool-title">
          <div className="modal">
            <button className="close-button" onClick={() => setActiveTool(null)} aria-label={t.close}>×</button>
            <p className="eyebrow">{activeTool.category}</p>
            <h2 id="tool-title">{activeTool.title}</h2>
            <p>{activeTool.description}</p>

            <ol className="instruction-list">
              {activeTool.instructions.map((instruction) => (
                <li key={instruction}>{instruction}</li>
              ))}
            </ol>

            <button className="primary-button" onClick={() => saveTool(activeTool)}>
              {t.saveTool}
            </button>

            <div className="feedback">
              <p>{t.didHelp}</p>
              <div>
                <button onClick={() => giveFeedback("a-lot")}>{t.aLot}</button>
                <button onClick={() => giveFeedback("a-little")}>{t.aLittle}</button>
                <button onClick={() => giveFeedback("not-really")}>{t.notReally}</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
