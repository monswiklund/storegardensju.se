import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import ContactSection from "./ContactSection.jsx";

afterEach(() => {
  vi.restoreAllMocks();
});

describe("ContactSection", () => {
  it("opens with only the subject chips, then shows the fields and focuses the name", () => {
    render(<ContactSection />);
    expect(screen.queryByLabelText(/Namn/)).not.toBeInTheDocument();
    expect(screen.queryByRole("button", { name: /Skicka meddelande/ })).not.toBeInTheDocument();

    fireEvent.click(screen.getByRole("radio", { name: /Övrigt/ }));
    expect(screen.getByLabelText(/Namn/)).toHaveFocus();
    expect(screen.getByLabelText(/Meddelande/)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Skicka meddelande/ })).toBeInTheDocument();
  });

  it("keeps the visitor's place when they change subject after writing their name", () => {
    render(<ContactSection initialSubject="course" />);
    const name = screen.getByLabelText(/Namn/);
    fireEvent.change(name, { target: { value: "Test Testsson" } });
    const email = screen.getByLabelText(/E-post/);
    email.focus();

    fireEvent.click(screen.getByRole("radio", { name: /Bröllop/ }));
    expect(email).toHaveFocus();
  });

  it("fills in a message sent by another page's CTA even before a subject was chosen", () => {
    render(<ContactSection />);
    window.dispatchEvent(
      new CustomEvent("expand-contact-form", {
        detail: { subject: "group", message: "Vi blir 12 personer." },
      }),
    );
    expect(screen.getByRole("radio", { name: /Gruppdagar/ })).toBeChecked();
    expect(screen.getByLabelText(/Meddelande/)).toHaveValue("Vi blir 12 personer.");
  });

  it("asks for date, guests and phone only when the subject is a gathering", () => {
    render(<ContactSection />);
    fireEvent.click(screen.getByRole("radio", { name: /Bröllop/ }));
    expect(screen.getByLabelText(/Önskat datum/)).toBeInTheDocument();
    expect(screen.getByLabelText(/Antal gäster/)).toBeInTheDocument();
    expect(screen.getByLabelText(/Telefon/)).toBeInTheDocument();

    fireEvent.click(screen.getByRole("radio", { name: /Kurs/ }));
    expect(screen.queryByLabelText(/Önskat datum/)).not.toBeInTheDocument();
  });

  it("sends the chosen subject and its inquiry type, without the hidden event fields", async () => {
    const fetchSpy = vi
      .spyOn(globalThis, "fetch")
      .mockResolvedValue(new Response(JSON.stringify({ ok: true }), { status: 201 }));
    render(<ContactSection initialSubject="course" />);

    expect(screen.getByRole("radio", { name: /Kurs/ })).toBeChecked();
    fireEvent.change(screen.getByLabelText(/Namn/), { target: { value: "Test Testsson" } });
    fireEvent.change(screen.getByLabelText(/E-post/), { target: { value: "test@example.se" } });
    fireEvent.change(screen.getByLabelText(/Meddelande/), { target: { value: "Finns det plats?" } });
    fireEvent.submit(screen.getByRole("button", { name: /Skicka meddelande/ }).closest("form"));

    await waitFor(() => expect(fetchSpy).toHaveBeenCalled());
    const body = JSON.parse(fetchSpy.mock.calls.at(-1)[1].body);
    expect(body).toMatchObject({ subject: "Kurs & workshop", type: "course", message: "Finns det plats?" });
    expect(body.preferredDate).toBe("");
    expect(await screen.findByRole("status")).toBeInTheDocument();
  });

  it("shows e-mail and Instagram as one line instead of cards", () => {
    render(<ContactSection />);
    expect(screen.getByRole("link", { name: /storegardensju@gmail.com/ })).toHaveAttribute(
      "href",
      "mailto:storegardensju@gmail.com",
    );
    expect(screen.getByRole("link", { name: /@storegarden7/ })).toBeInTheDocument();
  });
});
