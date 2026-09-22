"use client";

import { useState, type FormEvent } from "react";
import { isBlank, profile } from "@/lib/content";
import { Icon, type IconName } from "./Icon";
import { Field } from "./Placeholder";
import { Reveal } from "./Reveal";
import { Section } from "./Section";

/** Must match the `name` on the form element for Netlify to route it. */
const FORM_NAME = "contact";

type Status = "idle" | "sending" | "sent" | "error";

interface Errors {
  name?: string;
  email?: string;
  message?: string;
}

const inputClass =
  "w-full rounded-xl border border-line bg-mist-50 px-3.5 py-[11px] text-base text-ink-900 focus:border-steel-600 focus:shadow-[0_0_0_3px_rgba(79,93,110,0.18)] focus:outline-none aria-invalid:border-danger";

export function ContactSection() {
  const [status, setStatus] = useState<Status>("idle");
  const [errors, setErrors] = useState<Errors>({});
  const { email, institutionAddress, office } = profile.contact;

  const details: Array<[IconName, string, React.ReactNode]> = [
    [
      "mail",
      "Email",
      isBlank(email) ? <Field value="" /> : <a href={`mailto:${email}`}>{email}</a>,
    ],
    ["pin", "Address", <Field key="addr" value={institutionAddress} />],
    ["building", "Office", <Field key="office" value={office} />],
  ];

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const data = new FormData(form);

    const name = String(data.get("name") ?? "").trim();
    const address = String(data.get("email") ?? "").trim();
    const message = String(data.get("message") ?? "").trim();

    const nextErrors: Errors = {};
    if (!name) nextErrors.name = "Please enter your name.";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(address)) {
      nextErrors.email = "Please enter a valid email address.";
    }
    if (message.length < 10) {
      nextErrors.message = "Please enter a message (at least 10 characters).";
    }

    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) {
      setStatus("idle");
      const firstInvalid = form.querySelector<HTMLElement>("[aria-invalid='true']");
      firstInvalid?.focus();
      return;
    }

    setStatus("sending");
    try {
      // Netlify accepts the encoded form body at any path on the site.
      const body = new URLSearchParams();
      body.append("form-name", FORM_NAME);
      for (const [key, value] of data.entries()) {
        if (typeof value === "string") body.append(key, value);
      }
      const response = await fetch("/", {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: body.toString(),
      });
      if (!response.ok) throw new Error(`Form endpoint returned ${response.status}`);
      form.reset();
      setStatus("sent");
    } catch {
      setStatus("error");
    }
  }

  return (
    <Section id="contact" kicker="Get in touch" title="Contact">
      <Reveal className="grid grid-cols-1 gap-8 wide:grid-cols-[1fr_1.3fr] wide:gap-14">
        <div>
          {details.map(([icon, label, value]) => (
            <div key={label} className="mb-5.5 flex gap-4">
              <span className="flex size-11 shrink-0 items-center justify-center rounded-full bg-accent text-white shadow-glow">
                <Icon name={icon} className="size-5" />
              </span>
              <div>
                <h3 className="mb-0.5 font-sans text-[0.78rem] font-bold tracking-[0.1em] text-ink-500 uppercase">
                  {label}
                </h3>
                <p className="m-0 break-words">{value}</p>
              </div>
            </div>
          ))}
        </div>

        <form
          name={FORM_NAME}
          method="POST"
          data-netlify="true"
          data-netlify-honeypot="bot-field"
          onSubmit={handleSubmit}
          noValidate
          className="rounded-[18px] border border-line bg-white p-7 shadow-card"
        >
          {/* Netlify reads these two; the honeypot is hidden from people. */}
          <input type="hidden" name="form-name" value={FORM_NAME} />
          <p className="hidden">
            <label>
              Leave this field empty if you are human: <input name="bot-field" />
            </label>
          </p>

          <div className="mb-4">
            <label htmlFor="cf-name" className="mb-1.5 block text-[0.92rem] font-semibold text-ink-900">
              Name
            </label>
            <input
              id="cf-name"
              name="name"
              type="text"
              autoComplete="name"
              required
              aria-invalid={errors.name ? "true" : undefined}
              aria-describedby={errors.name ? "cf-name-error" : undefined}
              className={inputClass}
            />
            {errors.name && (
              <p id="cf-name-error" className="mt-1 text-[0.86rem] text-danger">
                {errors.name}
              </p>
            )}
          </div>

          <div className="mb-4">
            <label htmlFor="cf-email" className="mb-1.5 block text-[0.92rem] font-semibold text-ink-900">
              Email
            </label>
            <input
              id="cf-email"
              name="email"
              type="email"
              autoComplete="email"
              required
              aria-invalid={errors.email ? "true" : undefined}
              aria-describedby={errors.email ? "cf-email-error" : undefined}
              className={inputClass}
            />
            {errors.email && (
              <p id="cf-email-error" className="mt-1 text-[0.86rem] text-danger">
                {errors.email}
              </p>
            )}
          </div>

          <div className="mb-4">
            <label htmlFor="cf-subject" className="mb-1.5 block text-[0.92rem] font-semibold text-ink-900">
              Subject
            </label>
            <input id="cf-subject" name="subject" type="text" className={inputClass} />
          </div>

          <div className="mb-4">
            <label htmlFor="cf-message" className="mb-1.5 block text-[0.92rem] font-semibold text-ink-900">
              Message
            </label>
            <textarea
              id="cf-message"
              name="message"
              rows={5}
              required
              aria-invalid={errors.message ? "true" : undefined}
              aria-describedby={errors.message ? "cf-message-error" : undefined}
              className={inputClass}
            />
            {errors.message && (
              <p id="cf-message-error" className="mt-1 text-[0.86rem] text-danger">
                {errors.message}
              </p>
            )}
          </div>

          <button
            type="submit"
            disabled={status === "sending"}
            className="inline-flex cursor-pointer items-center gap-2 rounded-full border-[1.5px] border-transparent bg-accent bg-[length:160%_160%] bg-[position:0%_50%] px-6 py-3 text-[0.98rem] font-semibold text-white shadow-glow transition-all hover:-translate-y-0.5 hover:bg-[position:100%_50%] disabled:cursor-wait disabled:opacity-70 disabled:hover:translate-y-0"
          >
            {status === "sending" ? "Sending…" : "Send message"}
          </button>

          <p className="mt-3.5 font-semibold text-steel-700" role="status" aria-live="polite">
            {status === "sent" && "Thank you — your message has been sent."}
            {status === "error" && (
              <span className="text-danger">
                Sorry, the message could not be sent. Please email{" "}
                {isBlank(email) ? "the address shown" : <a href={`mailto:${email}`}>{email}</a>}{" "}
                instead.
              </span>
            )}
          </p>
        </form>
      </Reveal>
    </Section>
  );
}
