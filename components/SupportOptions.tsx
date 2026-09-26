"use client";

import { useState } from "react";
import type { Language } from "@/domain/i18n/copy";
import { contactHref, supportForRegion } from "@/domain/safety/support";

export function SupportOptions({ language, onToolbox }: { language: Language; onToolbox: () => void }) {
  const [region, setRegion] = useState("");
  const [phone, setPhone] = useState("");
  const service = supportForRegion(region);
  const dialer = contactHref(phone);
  const en = language === "en";

  return <section className="page-section support-options">
    <p className="eyebrow">{en ? "A next step, at your pace" : "Un próximo paso, a tu ritmo"}</p>
    <h1>{en ? "You can reach out." : "Puedes pedir apoyo."}</h1>
    <p className="hero-copy">{en ? "Needing support does not automatically mean an emergency. Choose what fits this moment. SootheSpot does not monitor your safety or contact anyone for you." : "Necesitar apoyo no significa automáticamente una emergencia. Elige lo que encaje con este momento. SootheSpot no supervisa tu seguridad ni contacta a nadie por ti."}</p>

    <div className="support-section">
      <h2>{en ? "Someone you trust" : "Alguien de confianza"}</h2>
      <p>{en ? "Call someone you trust or your care professional. You could say: “I'm having a hard moment. Could you stay with me or talk for a bit?”" : "Llama a alguien de confianza o a tu profesional de atención. Puedes decir: «Estoy pasando por un momento difícil. ¿Puedes acompañarme o hablar un rato?»"}</p>
      <label className="field-label" htmlFor="trusted-phone">{en ? "Their phone number (optional)" : "Su número de teléfono (opcional)"}</label>
      <input id="trusted-phone" className="search-input" type="tel" autoComplete="off" value={phone} onChange={(event) => setPhone(event.target.value)} aria-describedby="contact-note" />
      <p id="contact-note" className="control-note">{en ? "Only used to open your dialer. This number is not saved by SootheSpot." : "Solo se usa para abrir el marcador. SootheSpot no guarda este número."}</p>
      {dialer && <a className="action-link" href={dialer}>{en ? "Call this person" : "Llamar a esta persona"}</a>}
      {phone && !dialer && <p role="status">{en ? "Enter a phone number with 7–15 digits, including the country code if needed." : "Introduce un número de 7 a 15 dígitos, con el código de país si hace falta."}</p>}
    </div>

    <div className="support-section">
      <h2>{en ? "Talk with a support service" : "Habla con un servicio de apoyo"}</h2>
      <label className="field-label" htmlFor="support-region">{en ? "Where are you right now?" : "¿Dónde estás ahora?"}</label>
      <select id="support-region" value={region} onChange={(event) => setRegion(event.target.value)}>
        <option value="">{en ? "Choose a country or region" : "Elige un país o región"}</option>
        <option value="US">{en ? "United States" : "Estados Unidos"}</option>
        <option value="CA">{en ? "Canada" : "Canadá"}</option>
        <option value="other">{en ? "Somewhere else / prefer not to say" : "Otro lugar / prefiero no decirlo"}</option>
      </select>
      <p className="control-note">{en ? "Your choice is only used here and is not saved. Language does not determine your location." : "Tu elección solo se usa aquí y no se guarda. El idioma no determina tu ubicación."}</p>
      {service && <div className="regional-service" aria-live="polite">
        <h3>{service.name}</h3>
        <div className="control-actions">
          <a className="action-link" href={`tel:${service.phone}`}>{en ? "Call 988" : "Llamar al 988"}</a>
          <a className="action-link" href={`sms:${service.phone}`}>{en ? "Text 988" : "Enviar un texto al 988"}</a>
          <a href={service.source} target="_blank" rel="noreferrer">{en ? "Official service website" : "Sitio oficial del servicio"}</a>
        </div>
        <p className="control-note">{en ? "Source checked" : "Fuente consultada"}: {service.verifiedOn}. {en ? "See the official website for languages and access options." : "Consulta el sitio oficial para ver idiomas y opciones de acceso."}</p>
      </div>}
      <a className="action-link" href="https://findahelpline.com/" target="_blank" rel="noreferrer">{en ? "Find a helpline in your country" : "Busca una línea de ayuda en tu país"}</a>
      <p className="control-note">{en ? "External services have their own privacy policies. No check-in or toolbox data is included in these links." : "Los servicios externos tienen sus propias políticas de privacidad. Estos enlaces no incluyen datos de tu estado ni de tu caja de herramientas."}</p>
    </div>

    <div className="safety-card">
      <strong>{en ? "If there is immediate danger" : "Si hay peligro inmediato"}</strong>
      <p>{en ? "Contact your local emergency services now or go to the nearest emergency department. If possible, ask someone you trust to stay with you. Do not wait for a response from SootheSpot." : "Contacta ahora a los servicios de emergencia locales o acude al servicio de urgencias más cercano. Si es posible, pide a alguien de confianza que te acompañe. No esperes una respuesta de SootheSpot."}</p>
    </div>
    <button className="primary-button" onClick={onToolbox}>{en ? "Open my toolbox" : "Abrir mi caja de herramientas"}</button>
  </section>;
}
