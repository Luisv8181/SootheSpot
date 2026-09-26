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
import { historyLabel, strongestHelpfulContext, summarizeToolFeedback } from "@/domain/tools/history";
import { retrieveTools } from "@/domain/tools/retrieve";
import { seedTools } from "@/domain/tools/seed";
import type { CheckInState, MomentContext, Tool, ToolFeedback } from "@/domain/tools/types";
import { worlds } from "@/domain/worlds/seed";
import type { World } from "@/domain/worlds/types";
import { WorldExperience } from "@/components/WorldExperience";
import { usePersonalData } from "@/components/usePersonalData";
import { PersonalDataControls } from "@/components/PersonalDataControls";
import { SupportOptions } from "@/components/SupportOptions";
import { Dialog } from "@/components/Dialog";
import { deleteTool } from "@/domain/data/actions";
import { emptyData } from "@/domain/data/storage";

type Tab = "home" | "tools" | "resources" | "worlds" | "profile" | "support";

export default function Home() {
  const [tab, setTab] = useState<Tab>("home");
  const [state, setState] = useState<CheckInState | null>(null);
  const [language, setLanguage] = useState<Language>("en");
  const [availableMinutes, setAvailableMinutes] = useState<number | undefined>(5);
  const [momentContext, setMomentContext] = useState<MomentContext | undefined>();
  const { data, ready, notice, update, download } = usePersonalData();
  const { savedIds, feedback, savedResources, customTools, hiddenToolIds } = data;
  const [showToolCreator, setShowToolCreator] = useState(false);
  const [toolQuery, setToolQuery] = useState("");
  const [activeTool, setActiveTool] = useState<Tool | null>(null);
  const [resourceQuery, setResourceQuery] = useState("");
  const [activeWorld, setActiveWorld] = useState<World | null>(null);

  useEffect(() => {
    document.documentElement.lang = language;
  }, [language]);

  const allTools = useMemo(() => [...seedTools, ...customTools], [customTools]);
  const t = uiCopy[language];

  const recommendations = useMemo(() => {
    if (!state) return [];
    return retrieveTools(allTools, {
      state,
      language,
      feedback,
      availableMinutes,
      momentContext,
      hiddenToolIds
    });
  }, [state, language, feedback, availableMinutes, momentContext, allTools, hiddenToolIds]);
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
    const localized = localizeTool(tool, language);
    return !q || [localized.title, localized.description, localized.category].join(" ").toLowerCase().includes(q);
  });
  const visibleSavedResources = savedResources.filter((resource) => !toolQuery.trim() || [resource.name, resource.publisher, resource.description].join(" ").toLowerCase().includes(toolQuery.trim().toLowerCase()));
  const resources = searchResources(resourceQuery, language === "es" ? "Spanish" : "English");

  async function addCustomTool(tool: Tool) {
    const saved = await update((current) => ({ ...current, customTools: [...current.customTools, tool], savedIds: Array.from(new Set([...current.savedIds, tool.id])) }));
    if (saved) setShowToolCreator(false);
    return saved;
  }

  function deleteCustomTool(toolId: string) {
    if (window.confirm(language === "en" ? "Delete this tool and its feedback? This cannot be undone." : "¿Borrar esta herramienta y sus comentarios? No se puede deshacer.")) update((current) => deleteTool(current, toolId));
  }

  function saveTool(tool: Tool) {
    update((current) => ({ ...current, savedIds: Array.from(new Set([...current.savedIds, tool.id])) }));
  }

  function saveResource(resource: Resource) {
    update((current) => ({ ...current, savedResources: [...current.savedResources.filter((item) => item.id !== resource.id), resource] }));
  }

  async function giveFeedback(value: ToolFeedback["helpfulness"]) {
    if (!activeTool) return;
    const entry: ToolFeedback = {
      toolId: activeTool.id,
      helpfulness: value,
      createdAt: new Date().toISOString(),
      checkInState: state ?? undefined,
      momentContext
    };
    if (await update((current) => ({ ...current, feedback: [...current.feedback, entry] }))) setActiveTool(null);
  }

  async function clearDemoData() {
    if (!window.confirm(language === "en" ? "Delete all SootheSpot data in this browser, including tools, feedback, and hidden recommendations? Export first if you want a copy. This cannot be undone." : "¿Borrar todos los datos de SootheSpot en este navegador, incluidas herramientas, comentarios y recomendaciones ocultas? Exporta antes si quieres una copia. No se puede deshacer.")) return;
    if (!await update(emptyData, true)) return;
    setState(null);
    setMomentContext(undefined);
    setActiveTool(null);
    setActiveWorld(null);
    setShowToolCreator(false);
  }

  const noticeText = notice ? {
    loading: language === "en" ? "Opening your toolbox…" : "Abriendo tu caja de herramientas…",
    unreadable: language === "en" ? "Some saved data could not be read. It has not been overwritten. Export a backup from You before clearing it. Changes to unreadable collections are blocked." : "No se pudieron leer algunos datos guardados. No se han sobrescrito. Exporta una copia desde Tú antes de borrarlos. Los cambios en esas colecciones están bloqueados.",
    saveFailed: language === "en" ? "This change could not be saved. Your previous data is unchanged. Check browser storage settings or export a copy." : "No se pudo guardar este cambio. Tus datos anteriores no han cambiado. Revisa el almacenamiento del navegador o exporta una copia.",
    partialFailure: language === "en" ? "Storage stopped working during this change. Some changes may have been saved. Check your data and export a copy before continuing." : "El almacenamiento dejó de funcionar durante el cambio. Es posible que se guardaran algunos cambios. Revisa tus datos y exporta una copia antes de continuar.",
    saved: language === "en" ? "Saved in this browser." : "Guardado en este navegador.",
    exportFailed: language === "en" ? "The export could not be created. Your data has not been deleted." : "No se pudo crear la exportación. Tus datos no se han borrado."
  }[notice] : null;

  function feedbackLabel(toolId: string) {
    const summary = summarizeToolFeedback(feedback, toolId);
    if (summary.total === 0) return null;
    if (language === "en") return historyLabel(summary);
    const helpful = summary.aLot + summary.aLittle;
    return `Usada ${summary.total} ${summary.total === 1 ? "vez" : "veces"} · ${helpful} ${helpful === 1 ? "marcada como útil" : "marcadas como útiles"}`;
  }

  const momentContextLabels: Record<MomentContext, { en: string; es: string }> = {
    home: { en: "At home", es: "En casa" },
    "work-school": { en: "Work / school", es: "Trabajo / escuela" },
    sleep: { en: "Winding down", es: "Preparándome para dormir" },
    "around-people": { en: "Around people", es: "Con otras personas" },
    alone: { en: "By myself", es: "A solas" }
  };

  function recommendationReason(reason: string) {
    if (language === "en") return reason;
    if (reason.includes("this kind of situation")) return "La marcaste como útil antes en este tipo de situación.";
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
        {noticeText && !activeTool && !showToolCreator && <p className="storage-notice" role={notice === "saved" || notice === "loading" ? "status" : "alert"}>{noticeText}</p>}
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

                  <div className="moment-divider" />

                  <span className="moment-context-label">
                    {language === "en" ? "Right now I'm" : "Ahora mismo estoy"}
                  </span>
                  <div className="context-chip-row">
                    {(Object.keys(momentContextLabels) as MomentContext[]).map((context) => (
                      <button
                        key={context}
                        className={momentContext === context ? "context-chip selected" : "context-chip"}
                        onClick={() => setMomentContext(momentContext === context ? undefined : context)}
                        aria-pressed={momentContext === context}
                      >
                        {momentContextLabels[context][language]}
                      </button>
                    ))}
                  </div>
                  <span className="moment-context-note">
                    {language === "en"
                      ? "Optional. SootheSpot only uses this when you choose it."
                      : "Opcional. SootheSpot solo usa esto cuando tú lo eliges."}
                  </span>
                </div>
              )}
            </section>

            {state && (
              <section className="recommendation-section">
                <div className="section-heading">
                  <div>
                    <p className="eyebrow">{t.forThisMoment}</p>
                    <h2 id="recommendations-title" tabIndex={-1}>{stateCopy[language][state]}</h2>
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
                      <button onClick={() => setTab("support")}>{t.supportOptions}</button>
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
                    {recommendations.length === 0 && <div className="empty-state">
                      <p>{language === "en" ? "No tools match these choices right now. You can change the time, use your toolbox, or restore hidden recommendations in You." : "No hay herramientas que coincidan ahora. Puedes cambiar el tiempo, usar tu caja de herramientas o restaurar recomendaciones ocultas en Tú."}</p>
                      <button onClick={() => setTab("tools")}>{t.useToolbox}</button>
                    </div>}
                  </div>
                )}
              </section>
            )}

            {state !== "support" && <section className="featured-world">
              <div>
                <p className="eyebrow">{language === "en" ? "A few quiet minutes" : "Unos minutos de calma"}</p>
                <h2>{language === "en" ? "Nothing to solve right now." : "No hay nada que resolver ahora mismo."}</h2>
                <p>{language === "en" ? "Try a simple breathing experience and let your attention settle." : "Prueba una experiencia sencilla de respiración y deja que tu atención se asiente."}</p>
              </div>
              <button className="featured-world-button" onClick={() => setActiveWorld(worlds[0])}>{language === "en" ? "Open Ocean Calm" : "Abrir Ocean Calm"}</button>
            </section>}

            <section className="quick-section">
              <button className="quick-card" onClick={() => setTab("tools")}>
                <span>{t.toolbox}</span>
                <small>{savedTools.length + savedResources.length} {language === "en" ? "saved" : "guardados"}</small>
              </button>
              <button className="quick-card" onClick={() => setTab("resources")}>
                <span>{t.exploreResources}</span>
                <small>{resourceRegistry.length} {language === "en" ? "curated now" : "seleccionados"}</small>
              </button>
              <button className="quick-card" onClick={() => setTab("worlds")}>
                <span>{t.experiences}</span>
                <small>{worlds.length} {language === "en" ? "interactive worlds" : "mundos interactivos"}</small>
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
                    const contextInsight = strongestHelpfulContext(feedback, tool.id);
                    return (
                      <div className="insight-row" key={tool.id}>
                        <div>
                          <strong>{localizeTool(tool, language).title}</strong>
                          <span>
                            {language === "en"
                              ? `${summary.total} ${summary.total === 1 ? "use" : "uses"} · ${helpful} helpful`
                              : `${summary.total} ${summary.total === 1 ? "uso" : "usos"} · ${helpful} útiles`}
                          </span>
                          {contextInsight && (
                            <span className="insight-context">
                              {language === "en" ? "Helpful pattern: " : "Patrón útil: "}
                              {momentContextLabels[contextInsight.momentContext][language]}
                            </span>
                          )}
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
              <button disabled={!ready} className="primary-button compact-button" onClick={() => setShowToolCreator(true)}>{t.createTool}</button>
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
                    <button className="delete-tool-button" onClick={() => deleteCustomTool(tool.id)}>{language === "en" ? "Delete" : "Borrar"}</button>
                  )}
                  {!tool.id.startsWith("custom-") && <button className="delete-tool-button" onClick={() => update((current) => ({ ...current, savedIds: current.savedIds.filter((id) => id !== tool.id) }))}>{language === "en" ? "Remove from toolbox" : "Quitar de la caja"}</button>}
                </div>
              ))}
              {visibleSavedResources.map((resource) => (
                <div className="saved-resource-row" key={resource.id}>
                  <div>
                    <strong>{resource.name}</strong>
                    <span>{resource.publisher}</span>
                  </div>
                  <a href={resource.official_url} target="_blank" rel="noreferrer">{language === "en" ? "Open" : "Abrir"}</a>
                  <button onClick={() => update((current) => ({ ...current, savedResources: current.savedResources.filter((item) => item.id !== resource.id) }))}>{language === "en" ? "Remove" : "Quitar"}</button>
                </div>
              ))}
            </div>

            {!visibleSavedTools.length && !visibleSavedResources.length && (
              <div className="empty-state">
                <p>{toolQuery ? (language === "en" ? "Nothing in your toolbox matches this search." : "Nada en tu caja coincide con esta búsqueda.") : (language === "en" ? "Start with something you already know helps, or save a recommendation from Home." : "Empieza con algo que ya sabes que te ayuda o guarda una recomendación de Inicio.")}</p>
                <button onClick={() => toolQuery ? setToolQuery("") : setTab("home")}>{toolQuery ? (language === "en" ? "Clear search" : "Borrar búsqueda") : (language === "en" ? "Find a tool" : "Buscar una herramienta")}</button>
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
              {resources.length === 0 && <p className="empty-state">{language === "en" ? "No resources match this search and language. Try another search." : "No hay recursos para esta búsqueda e idioma. Prueba otra búsqueda."}</p>}
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

        {tab === "support" && <SupportOptions language={language} onToolbox={() => setTab("tools")} />}

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

            <button className="primary-button" onClick={() => setTab("support")}>{t.supportOptions}</button>
            <PersonalDataControls data={data} tools={allTools} language={language} update={update} onExport={download} onClear={clearDemoData} />
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

      {showToolCreator && <ToolCreator onCreate={addCustomTool} onClose={() => setShowToolCreator(false)} language={language} storageError={noticeText} />}

      {activeWorld && <WorldExperience world={activeWorld} onClose={() => setActiveWorld(null)} language={language} />}

      {activeTool && (
        <Dialog titleId="tool-title" onClose={() => setActiveTool(null)}>
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

            {noticeText && <p className="storage-notice" role="status">{noticeText}</p>}
            <button disabled={!ready || savedIds.includes(activeTool.id)} className="primary-button" onClick={() => saveTool(activeTool)}>
              {savedIds.includes(activeTool.id) ? (language === "en" ? "Saved to My Toolbox" : "Guardado en mi caja") : t.saveTool}
            </button>
            <button className="delete-tool-button" onClick={async () => {
              const id = activeTool.id;
              const restore = hiddenToolIds.includes(id);
              const saved = await update((current) => ({ ...current, hiddenToolIds: restore ? current.hiddenToolIds.filter((item) => item !== id) : Array.from(new Set([...current.hiddenToolIds, id])) }));
              if (saved) setActiveTool(null);
            }}>{hiddenToolIds.includes(activeTool.id) ? (language === "en" ? "Allow recommendations again" : "Permitir recomendaciones otra vez") : (language === "en" ? "Don't recommend this" : "No recomendar esto")}</button>

            <div className="feedback">
              <p>{t.didHelp}</p>
              <div>
                <button onClick={() => giveFeedback("a-lot")}>{t.aLot}</button>
                <button onClick={() => giveFeedback("a-little")}>{t.aLittle}</button>
                <button onClick={() => giveFeedback("not-really")}>{t.notReally}</button>
              </div>
            </div>
          </div>
        </Dialog>
      )}
    </main>
  );
}
