"use client";

import "./skills.css";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

type BranchId = "resilience" | "emotions" | "thoughts" | "action" | "connection" | "purpose";
type Skill = {
  id: string; branch: BranchId; title: string; subtitle: string; minutes: number;
  approach: string; when: string; steps: string[]; caution?: string; prerequisites: string[];
  related: string[];
};
type Branch = { id: BranchId; name: string; short: string; color: string; icon: string; description: string };

const branches: Branch[] = [
  { id: "resilience", name: "Resilience", short: "STEADY YOURSELF", color: "#9dc9dc", icon: "◉", description: "Get through difficult moments without making them harder." },
  { id: "emotions", name: "Emotional Mastery", short: "READ THE SIGNAL", color: "#e5b875", icon: "✳", description: "Notice what you feel, what sets it off, and what you need." },
  { id: "thoughts", name: "Mental Flexibility", short: "WIDEN THE VIEW", color: "#c3a7e9", icon: "◇", description: "Make room for more than one interpretation." },
  { id: "action", name: "Action & Discipline", short: "TAKE THE NEXT STEP", color: "#9bcba7", icon: "➤", description: "Turn stuckness into one manageable action." },
  { id: "connection", name: "Connection", short: "MEET EACH OTHER", color: "#8bd1c8", icon: "⌘", description: "Express needs and care for relationships without abandoning yourself." },
  { id: "purpose", name: "Purpose & Wisdom", short: "LIVE WHAT MATTERS", color: "#e1a49e", icon: "✺", description: "Move toward your values while making room for life's difficulty." }
];

const skills: Skill[] = [
  { id: "notice-five", branch: "resilience", title: "Return to the Room", subtitle: "Sensory grounding", minutes: 2, approach: "Grounding / mindfulness", when: "When worry pulls your attention away from the present and noticing your surroundings feels comfortable.", steps: ["Look around and name three neutral things you can see.", "Notice two sounds, near or far.", "Feel where your body is supported by a chair, floor, or another surface.", "Ask yourself: what is one small thing I need in this moment?"], caution: "If focusing on your body or senses increases distress, stop and try an external activity or contact someone you trust.", prerequisites: [], related: ["orienting", "thought-distance"] },
  { id: "orienting", branch: "resilience", title: "Orient to Safety", subtitle: "Gentle present-moment check", minutes: 2, approach: "Grounding", when: "When you feel unsettled and want to check what is happening around you.", steps: ["If possible, look toward the room or place you are in.", "Identify where you are and what is happening right now.", "Notice one sign of support or stability, if any.", "Choose whether you need action, rest, or another person."], prerequisites: ["notice-five"], related: ["pause", "self-soothe"] },
  { id: "pause", branch: "resilience", title: "Make a Little Space", subtitle: "Pause before responding", minutes: 1, approach: "Distress tolerance", when: "When emotions are rising and you have a moment before responding.", steps: ["Notice the urge to act without judging yourself for having it.", "If safe, pause the conversation or action briefly.", "Choose one neutral action: unclench your hands, look outside, or take a sip of water.", "Decide on the next small step when you're ready."], prerequisites: ["notice-five"], related: ["urge-surf", "assertive-ask"] },
  { id: "self-soothe", branch: "resilience", title: "Build a Sensory Anchor", subtitle: "Self-soothing", minutes: 3, approach: "DBT-informed distress tolerance", when: "When a comforting sensory experience could help you get through a hard moment.", steps: ["Choose a sense that feels comfortable: sound, touch, sight, taste, or smell.", "Pick one safe, accessible sensory anchor.", "Give it your attention for a minute or two.", "Notice whether it helped even slightly; change course if not."], prerequisites: ["orienting"], related: ["world-ocean", "notice-five"] },
  { id: "urge-surf", branch: "resilience", title: "Ride the Urge", subtitle: "Urge surfing", minutes: 3, approach: "Mindfulness / relapse-prevention skill", when: "When an urge is strong but you can safely wait before acting on it.", steps: ["Name the urge and the action it is asking for.", "Notice whether it changes in intensity over time.", "Delay the decision briefly if that is safe and appropriate.", "Choose a response that fits your longer-term needs."], caution: "Do not use delay as a substitute for urgent medical care or immediate safety support.", prerequisites: ["pause"], related: ["values-compass", "pause"] },
  { id: "name-it", branch: "emotions", title: "Name the Feeling", subtitle: "Emotional vocabulary", minutes: 2, approach: "Emotion regulation", when: "When everything feels tangled or you only know that something feels wrong.", steps: ["Pause and ask: what emotion might be here?", "Try a more specific word than good, bad, or stressed.", "Notice whether two emotions are present at once.", "You do not have to fix the feeling to name it."], prerequisites: [], related: ["needs-signal", "check-facts"] },
  { id: "needs-signal", branch: "emotions", title: "Read the Signal", subtitle: "Identify the need", minutes: 3, approach: "Emotion awareness", when: "When you want to understand what a feeling may be pointing toward.", steps: ["Name the emotion as best you can.", "Ask what happened just before it showed up.", "Consider what matters or what need may be involved.", "Treat your answer as a possibility to explore, not an unquestionable fact."], prerequisites: ["name-it"], related: ["check-facts", "assertive-ask"] },
  { id: "check-facts", branch: "emotions", title: "Check the Facts", subtitle: "Separate event from interpretation", minutes: 4, approach: "DBT-informed emotion regulation", when: "When an assumption is intensifying an emotion and you have enough calm to examine it.", steps: ["Write down what you know happened, without guesses.", "List the meaning you are assigning to it.", "Ask what evidence supports or complicates that meaning.", "Choose a response based on the facts you have, while allowing uncertainty."], prerequisites: ["name-it"], related: ["thought-distance", "needs-signal"] },
  { id: "opposite-action", branch: "emotions", title: "Choose a Helpful Opposite", subtitle: "Opposite action", minutes: 4, approach: "DBT-informed emotion regulation", when: "When an emotion-driven impulse does not fit the facts or your goals, and another action is safe.", steps: ["Name the emotion and the action it urges.", "Check whether the emotion and urge fit the facts.", "Consider a small action in a different direction.", "Try it gently and notice what you learn."], caution: "This is not advice to ignore danger, suppress feelings, or remain in an unsafe situation.", prerequisites: ["check-facts", "pause"], related: ["one-step", "assertive-ask"] },
  { id: "thought-distance", branch: "thoughts", title: "A Thought Is Not a Fact", subtitle: "Cognitive defusion", minutes: 2, approach: "ACT-informed", when: "When a thought feels like the whole truth or takes over your attention.", steps: ["Notice the thought in its own words.", "Try saying: 'I'm noticing the thought that…'", "See whether that wording gives you a little distance.", "Choose what you want to do next, even if the thought remains."], prerequisites: [], related: ["alternative-view", "values-compass"] },
  { id: "alternative-view", branch: "thoughts", title: "Find Another Angle", subtitle: "Cognitive reappraisal", minutes: 5, approach: "CBT-informed", when: "When you want to test an interpretation that is causing distress.", steps: ["Write the situation and your first interpretation.", "Ask what evidence supports it and what evidence is missing.", "Imagine what you would say to a friend in the same situation.", "Create a balanced alternative that still respects what is difficult."], prerequisites: ["thought-distance"], related: ["check-facts", "problem-map"] },
  { id: "worry-window", branch: "thoughts", title: "Give Worry a Container", subtitle: "Scheduled worry", minutes: 3, approach: "CBT-informed coping", when: "When repetitive worry keeps interrupting something you want to do.", steps: ["Write a brief note about the worry.", "Ask whether there is a useful action to take now.", "If not, choose a later time to revisit it if scheduling worry suits you.", "Return to one concrete task in front of you."], prerequisites: ["thought-distance"], related: ["one-step", "alternative-view"] },
  { id: "self-compassion", branch: "thoughts", title: "Speak to Yourself Like a Person", subtitle: "Self-compassion", minutes: 3, approach: "Compassion-focused practice", when: "When self-criticism is making a difficult moment heavier.", steps: ["Notice the harsh sentence you are telling yourself.", "Imagine how you would respond to someone you care about.", "Offer yourself a truthful, kinder sentence without pretending everything is fine.", "Ask what support or repair would help now."], prerequisites: ["thought-distance"], related: ["values-compass", "name-it"] },
  { id: "one-step", branch: "action", title: "The Next Small Step", subtitle: "Task breakdown", minutes: 3, approach: "Problem-solving", when: "When a task feels so big that starting is difficult.", steps: ["State the task in one sentence.", "Choose a step small enough to do in five minutes or less.", "Make the first action visible: open the document, put on shoes, or send one question.", "Afterward, decide whether to continue, pause, or ask for help."], prerequisites: [], related: ["problem-map", "worry-window"] },
  { id: "problem-map", branch: "action", title: "Map What You Can Change", subtitle: "Structured problem-solving", minutes: 5, approach: "Problem-solving therapy principles", when: "When a problem is real and you want to identify practical options.", steps: ["Describe the problem specifically.", "Separate what you can influence from what you cannot control.", "List two or three possible next actions.", "Choose one action and identify any help or resource needed."], prerequisites: ["one-step"], related: ["alternative-view", "ask-for-help"] },
  { id: "behavioral-activation", branch: "action", title: "Move Before Motivation Arrives", subtitle: "Behavioral activation", minutes: 5, approach: "Behavioral activation", when: "When low mood or inertia is making it hard to do something that usually matters to you.", steps: ["Choose a small activity linked to care, connection, mastery, or enjoyment.", "Make it brief and specific.", "Schedule or start the first step.", "Notice how it felt; the goal is practice, not forcing a good mood."], prerequisites: ["one-step"], related: ["values-compass", "problem-map"] },
  { id: "reset-routine", branch: "action", title: "Create a Reset Routine", subtitle: "Implementation intention", minutes: 4, approach: "Behavior change", when: "When a recurring situation could benefit from a simple prepared response.", steps: ["Name the situation that tends to throw you off.", "Complete the sentence: 'When X happens, I will try Y.'", "Make Y realistic for your environment and energy.", "Adjust the plan after trying it; a missed attempt is information, not failure."], prerequisites: ["one-step"], related: ["self-soothe", "behavioral-activation"] },
  { id: "assertive-ask", branch: "connection", title: "Ask Clearly for What You Need", subtitle: "Assertive communication", minutes: 4, approach: "Interpersonal effectiveness", when: "When you want to make a request without guessing that another person should know what you need.", steps: ["Describe the situation briefly and specifically.", "Say what you need or request in direct, respectful language.", "Leave room for the other person to respond.", "Consider alternatives if the answer is no."], prerequisites: [], related: ["boundary-line", "active-listening"] },
  { id: "boundary-line", branch: "connection", title: "Set a Kind, Clear Boundary", subtitle: "Boundary practice", minutes: 4, approach: "Interpersonal effectiveness", when: "When you need to communicate a limit, capacity, or preference.", steps: ["Identify the limit you need to protect.", "State it simply, without overexplaining if that feels safe.", "Offer an alternative only if you genuinely want to.", "Repeat or seek support if the boundary is not respected."], caution: "If setting a boundary could put you at risk, prioritize safety and seek trusted, context-aware support.", prerequisites: ["assertive-ask"], related: ["active-listening", "ask-for-help"] },
  { id: "active-listening", branch: "connection", title: "Listen to Understand", subtitle: "Reflective listening", minutes: 3, approach: "Communication skill", when: "When a conversation is important and both people have enough space to participate.", steps: ["Give the other person your attention if you can.", "Reflect the main point in your own words.", "Ask whether you understood correctly.", "Share your view after checking what you heard."], prerequisites: ["assertive-ask"], related: ["boundary-line", "repair-talk"] },
  { id: "repair-talk", branch: "connection", title: "Repair After a Rupture", subtitle: "Conflict repair", minutes: 5, approach: "Relationship skills", when: "When a disagreement has caused hurt and it is safe and appropriate to reconnect.", steps: ["Name your part without taking responsibility for everything.", "Acknowledge the impact you understand.", "Ask what would help repair the situation.", "Agree on one specific next step, or respect the need for distance."], prerequisites: ["active-listening"], related: ["self-compassion", "assertive-ask"] },
  { id: "values-compass", branch: "purpose", title: "Choose Your Compass", subtitle: "Values clarification", minutes: 5, approach: "ACT-informed", when: "When you are unsure what to do and want to reconnect with what matters to you.", steps: ["Choose a life area that matters to you, such as relationships, learning, care, or community.", "Describe the kind of person you want to be in that area.", "Choose one small action that expresses that value today.", "Let the action matter even if the feeling does not change immediately."], prerequisites: [], related: ["one-step", "thought-distance"] },
  { id: "acceptance-space", branch: "purpose", title: "Make Room for What Is Here", subtitle: "Acceptance", minutes: 3, approach: "ACT-informed", when: "When struggling against an emotion is adding a second layer of suffering and it is safe to pause.", steps: ["Name what is present without deciding it should not be there.", "Notice the difference between accepting a feeling and approving a situation.", "Ask what is within your influence right now.", "Choose a small values-aligned action or a supportive pause."], prerequisites: ["values-compass"], related: ["self-compassion", "thought-distance"] },
  { id: "ask-for-help", branch: "purpose", title: "Let Someone In", subtitle: "Support seeking", minutes: 3, approach: "Social support / coping planning", when: "When the situation is too much to manage alone or connection would help.", steps: ["Think of a person, service, or professional who may be appropriate.", "Choose what you want them to know.", "Make a specific request, such as listening, practical help, or staying with you.", "If the first person cannot help, consider another safe option."], prerequisites: [], related: ["assertive-ask", "problem-map"] },
  { id: "self-kindness", branch: "purpose", title: "Offer Yourself Kindness", subtitle: "Compassionate response", minutes: 2, approach: "Self-compassion", when: "When you are disappointed in yourself or having a hard day.", steps: ["Acknowledge that this moment is difficult.", "Remind yourself that difficulty is part of being human, without minimizing your own experience.", "Choose one kind and realistic response toward yourself.", "Ask what you would need to get through the next hour."], prerequisites: [], related: ["self-compassion", "acceptance-space"] }
];

const STORAGE_KEY = "soothespot.skill-tree.v1";
type Progress = { practiced: string[]; helpful: Record<string, "yes" | "some" | "no">; saved: string[] };

export default function SkillTreePage() {
  const [branchId, setBranchId] = useState<BranchId>("resilience");
  const [activeSkillId, setActiveSkillId] = useState<string | null>(null);
  const [progress, setProgress] = useState<Progress>({ practiced: [], helpful: {}, saved: [] });
  const [ready, setReady] = useState(false);
  const [showProgress, setShowProgress] = useState(false);

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as Partial<Progress>;
        setProgress({
          practiced: Array.isArray(parsed.practiced) ? parsed.practiced.filter((id): id is string => skills.some((skill) => skill.id === id)) : [],
          helpful: parsed.helpful && typeof parsed.helpful === "object" ? parsed.helpful : {},
          saved: Array.isArray(parsed.saved) ? parsed.saved.filter((id): id is string => skills.some((skill) => skill.id === id)) : []
        });
      }
    } catch { /* Keep this session usable if browser storage is unavailable. */ }
    setReady(true);
  }, []);

  function commit(next: Progress) {
    setProgress(next);
    try { window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next)); } catch { /* Progress remains available for this session. */ }
  }

  const activeSkill = skills.find((skill) => skill.id === activeSkillId) ?? null;
  const activeBranch = branches.find((branch) => branch.id === branchId) ?? branches[0];
  const branchSkills = skills.filter((skill) => skill.branch === branchId);
  const practicedCount = progress.practiced.length;
  const completion = Math.round((practicedCount / skills.length) * 100);
  const branchProgress = useMemo(() => Object.fromEntries(branches.map((branch) => {
    const all = skills.filter((skill) => skill.branch === branch.id);
    return [branch.id, { done: all.filter((skill) => progress.practiced.includes(skill.id)).length, total: all.length }];
  })) as Record<BranchId, { done: number; total: number }>, [progress.practiced]);

  function isAvailable(skill: Skill) {
    return skill.prerequisites.every((id) => progress.practiced.includes(id));
  }

  function practice(skill: Skill) {
    commit({ ...progress, practiced: Array.from(new Set([...progress.practiced, skill.id])) });
  }

  function toggleSaved(skill: Skill) {
    const saved = progress.saved.includes(skill.id) ? progress.saved.filter((id) => id !== skill.id) : [...progress.saved, skill.id];
    commit({ ...progress, saved });
  }

  return (
    <main className="skill-app">
      <header className="skill-topbar">
        <Link href="/" className="skill-brand"><span className="skill-brand-mark">S</span> SootheSpot</Link>
        <span className="skill-topbar-note">YOUR PERSONAL SKILL ATLAS</span>
        <Link href="/" className="skill-back-link">← Home</Link>
      </header>

      <div className="skill-page">
        <section className="skill-hero">
          <div className="skill-hero-copy">
            <p className="skill-eyebrow">A CHARACTER BUILD FOR REAL LIFE</p>
            <h1>Build skills for the life you’re living.</h1>
            <p>Explore small, evidence-informed practices for difficult moments, relationships, and the things that matter to you. Choose your own path.</p>
            <div className="skill-hero-actions">
              <button className="skill-primary" onClick={() => { setBranchId("resilience"); setActiveSkillId("notice-five"); }}>Start with a skill <span>↗</span></button>
              <button className="skill-secondary" onClick={() => setShowProgress(!showProgress)}>{showProgress ? "Hide progress" : "View my progress"}</button>
            </div>
          </div>
          <div className="skill-hero-art" aria-hidden="true">
            <div className="skill-orbit orbit-one" /><div className="skill-orbit orbit-two" />
            <div className="skill-core"><span>✦</span><small>YOUR<br/>NEXT STEP</small></div>
            <span className="skill-star star-one">✧</span><span className="skill-star star-two">✦</span><span className="skill-star star-three">✧</span>
          </div>
        </section>

        {showProgress && <section className="skill-progress-panel">
          <div><span className="skill-eyebrow">YOUR PRACTICE</span><h2>{practicedCount} of {skills.length} skills explored</h2><p>Progress means you tried a practice, not that you have mastered a clinical skill.</p></div>
          <div className="skill-progress-track" role="progressbar" aria-label="Skills practiced" aria-valuemin={0} aria-valuemax={skills.length} aria-valuenow={practicedCount}><span style={{ width: `${completion}%` }} /></div>
          <button className="skill-text-button" onClick={() => { if (window.confirm("Reset your skill-tree progress on this device? This cannot be undone.")) commit({ practiced: [], helpful: {}, saved: [] }); }}>Reset progress</button>
        </section>}

        <section className="skill-branches-section">
          <div className="skill-section-heading"><div><p className="skill-eyebrow">CHOOSE YOUR PATH</p><h2>Six ways to grow</h2></div><p>No required order. Start where life is asking something of you.</p></div>
          <div className="skill-branch-grid">
            {branches.map((branch) => {
              const stats = branchProgress[branch.id];
              return <button key={branch.id} className={branch.id === branchId ? "skill-branch-card selected" : "skill-branch-card"} onClick={() => { setBranchId(branch.id); setActiveSkillId(null); }} style={{ "--branch-color": branch.color } as React.CSSProperties} aria-pressed={branch.id === branchId}>
                <span className="skill-branch-icon">{branch.icon}</span><span className="skill-branch-text"><strong>{branch.name}</strong><small>{branch.description}</small></span><span className="skill-branch-count">{stats.done}/{stats.total}</span>
              </button>;
            })}
          </div>
        </section>

        <section className="skill-map-section" aria-labelledby="skill-map-title">
          <div className="skill-map-heading"><div><p className="skill-eyebrow">{activeBranch.short}</p><h2 id="skill-map-title">{activeBranch.name}</h2><p>{activeBranch.description}</p></div><span className="skill-map-progress" style={{ "--branch-color": activeBranch.color } as React.CSSProperties}>{branchProgress[branchId].done} / {branchProgress[branchId].total} practiced</span></div>
          <div className="skill-map" style={{ "--branch-color": activeBranch.color } as React.CSSProperties}>
            <div className="skill-map-lines" aria-hidden="true"><span/><span/><span/><span/></div>
            {branchSkills.map((skill, index) => {
              const done = progress.practiced.includes(skill.id);
              const available = isAvailable(skill);
              return <button key={skill.id} className={`skill-node ${done ? "practiced" : ""} ${available ? "available" : "locked"}`} style={{ "--node-index": index, "--branch-color": activeBranch.color } as React.CSSProperties} onClick={() => setActiveSkillId(skill.id)} aria-label={`${skill.title}, ${done ? "practiced" : available ? "available" : "related skill"}`}>
                <span className="skill-node-glyph">{done ? "✓" : available ? "✧" : "·"}</span><strong>{skill.title}</strong><small>{skill.subtitle}</small>{!available && !done && <span className="skill-node-requirement">Build toward</span>}
              </button>;
            })}
          </div>
          <p className="skill-map-note">Connected skills suggest a possible learning path, not a gate. Any skill can be opened whenever you need it.</p>
        </section>

        {activeSkill && <section className="skill-detail" aria-labelledby="active-skill-title">
          <div className="skill-detail-top"><div><p className="skill-eyebrow">{branches.find((branch) => branch.id === activeSkill.branch)?.name} · {activeSkill.minutes} MIN</p><h2 id="active-skill-title">{activeSkill.title}</h2><p className="skill-detail-subtitle">{activeSkill.subtitle}</p></div><button className="skill-close" onClick={() => setActiveSkillId(null)} aria-label="Close skill">×</button></div>
          <div className="skill-detail-grid"><div><h3>When it may help</h3><p>{activeSkill.when}</p><h3>Practice</h3><ol className="skill-steps">{activeSkill.steps.map((step) => <li key={step}>{step}</li>)}</ol>{activeSkill.caution && <p className="skill-caution"><strong>Keep in mind:</strong> {activeSkill.caution}</p>}</div><aside className="skill-detail-aside"><span className="skill-detail-icon" style={{ "--branch-color": branches.find((branch) => branch.id === activeSkill.branch)?.color } as React.CSSProperties}>✦</span><p className="skill-eyebrow">APPROACH</p><p>{activeSkill.approach}</p><p className="skill-source-note">Educational practice based on established therapeutic concepts. This is not individualized treatment or a promise of effectiveness.</p><button className="skill-primary skill-full" disabled={progress.practiced.includes(activeSkill.id)} onClick={() => practice(activeSkill)}>{progress.practiced.includes(activeSkill.id) ? "✓ Practice recorded" : "Mark as practiced"}</button><button className="skill-secondary skill-full" onClick={() => toggleSaved(activeSkill)}>{progress.saved.includes(activeSkill.id) ? "★ Saved to quick list" : "☆ Save to quick list"}</button><div className="skill-helpful"><span>Was this useful?</span><div>{([{ id: "yes", label: "Yes" }, { id: "some", label: "A little" }, { id: "no", label: "Not really" }] as const).map((choice) => <button key={choice.id} className={progress.helpful[activeSkill.id] === choice.id ? "selected" : ""} onClick={() => commit({ ...progress, helpful: { ...progress.helpful, [activeSkill.id]: choice.id } })} aria-pressed={progress.helpful[activeSkill.id] === choice.id}>{choice.label}</button>)}</div></div></aside></div>
          <div className="skill-related"><h3>Related skills</h3>{activeSkill.related.map((id) => { const related = skills.find((skill) => skill.id === id); return related ? <button key={id} onClick={() => { setBranchId(related.branch); setActiveSkillId(id); }}>{related.title} <span>↗</span></button> : null; })}</div>
        </section>}

        <section className="skill-quick-list"><div><p className="skill-eyebrow">YOUR LOADOUT</p><h2>Skills you want close at hand</h2><p>Save a few practices to make them easier to find again.</p></div>{progress.saved.length ? <div className="skill-saved-list">{progress.saved.map((id) => { const skill = skills.find((item) => item.id === id); return skill ? <button key={id} onClick={() => { setBranchId(skill.branch); setActiveSkillId(id); }}>{skill.title}<span>↗</span></button> : null; })}</div> : <p className="skill-empty-loadout">No saved skills yet. Open any node and choose “Save to quick list.”</p>}</section>

        <section className="skill-footnote"><strong>A note about progression</strong><p>There are no streaks, penalties, or points for being distressed. Progress records practice you chose to try; it does not measure your worth or clinical improvement. Immediate coping and support options should never be locked behind this tree.</p><p>Skill content is educational and should be reviewed by qualified professionals before being presented as clinician-curated.</p></section>
      </div>
      <footer className="skill-footer"><span>SootheSpot</span><span>Context · Culture · Privacy · Agency</span><span>{ready ? "Saved on this device when browser storage is available." : "Loading your local progress…"}</span></footer>
    </main>
  );
}
