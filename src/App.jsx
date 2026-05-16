import { useState, useRef, useEffect } from "react";

const EBOOK = {
  title: "IA para el Trabajo",
  subtitle: "Guía práctica para hacer más con menos tiempo",
  price: 9900,
  originalPrice: 18900,
  chapters: 7,
  pages: 120,
  cover: "🤖",
  benefits: [
    "ChatGPT, Claude y Gemini explicados desde cero",
    "Prompts listos para copiar y usar hoy mismo",
    "Cómo redactar informes y emails en minutos",
    "Organizá tu semana con IA en 5 minutos",
    "Presentaciones profesionales sin ser diseñador",
    "Tu primer agente automatizado paso a paso",
  ],
  bonus: "BONUS: Plantilla de 50 prompts para el trabajo",
};

const SYSTEM_PROMPT = `Sos Aria, una asesora de ventas cálida, inteligente y directa que vende el siguiente ebook:

PRODUCTO: "${EBOOK.title}"
SUBTÍTULO: "${EBOOK.subtitle}"
PRECIO ESPECIAL: $${EBOOK.price.toLocaleString("es-AR")} ARS (antes $${EBOOK.originalPrice.toLocaleString("es-AR")}) — 47% de descuento
CONTENIDO: ${EBOOK.chapters} capítulos, ${EBOOK.pages} páginas, PDF descargable
BONUS: Plantilla de 50 prompts listos para el trabajo

LO QUE APRENDEN:
- Qué es la IA y cómo usarla sin saber programar
- ChatGPT, Claude y Gemini: cuál usar y para qué
- Redactar emails, informes y coariacados en minutos
- Planificar y organizar la semana con IA
- Hacer presentaciones profesionales sin diseñador
- Atender consultas automáticamente 24/7
- Construir su primer agente automatizado paso a paso

PARA QUIÉN ES:
- Empleados y funcionarios que quieren trabajar más rápido
- Emprendedores que quieren automatizar tareas
- Cualquier persona que quiera aprender IA sin tecnicismos
- No requiere conocimientos previos

GARANTÍA: 7 días de devolución total si no les sirve

TU ESTILO DE VENTA:
- Respondé en español rioplatense, de manera cálida y natural
- Máximo 3-4 oraciones por respuesta, sé conciso y directo
- Usá emojis con moderación (1-2 por mensaje máximo)
- Detectá el dolor o la necesidad real de la persona
- Conectá el ebook con su problema específico antes de dar el precio
- Cuando muestren interés claro, ofrecé el cierre con urgencia real (precio especial por tiempo limitado)
- Si preguntan el precio, mencioná el descuento del 47% y la garantía de 7 días
- Si ponen objeciones de precio: recordá que es menos que un café por día durante un mes
- Si dicen que no tienen tiempo para leerlo: deciles que cada capítulo se lee en 15 minutos y viene con prompts listos para usar inmediatamente
- Si ya están convencidos, deciles que hagan clic en "Comprar ahora — Acceso inmediato"
- Nunca des información falsa ni promesas exageradas

FLUJO NATURAL:
1. Saludá y preguntá en qué trabajan o qué les interesa
2. Identificá su dolor (falta de tiempo, tareas repetitivas, no saber por dónde empezar con IA)
3. Conectá el ebook con su situación específica
4. Cuando sea el momento, presentá el precio con el descuento y la garantía
5. Cierre: invitalos a hacer clic en el botón de compra`;

const QUICK_REPLIES = [
  "¿De qué trata el ebook?",
  "¿Cuánto cuesta?",
  "¿Para quién es?",
  "¿Necesito saber de tecnología?",
];

const TESTIMONIALS = [
  { name: "Romina G.", role: "Empleada ariacipal", text: "Empecé a usar IA al segundo día de leer el capítulo 3. Mis informes me llevan la mitad del tiempo." },
  { name: "Martín V.", role: "Emprendedor", text: "El capítulo del agente automatizado me cambió el negocio. Ahora tengo respuestas automáticas en WhatsApp." },
  { name: "Laura P.", role: "Docente", text: "Pensé que era muy difícil. Pero está explicado tan simple que en una tarde ya lo estaba usando." },
];

export default function AgenteVentas() {
  const [messages, setMessages] = useState([
    {
      role: "assistant",
      content: `¡Hola! 👋 Soy Aria, tu asesora. Vi que te interesa la IA aplicada al trabajo... ¿En qué trabajás o qué tipo de tareas te gustaría automatizar?`,
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [sold, setSold] = useState(false);
  const [showBenefits, setShowBenefits] = useState(false);
  const [activeTestimonial, setActiveTestimonial] = useState(0);
  const bottomRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  useEffect(() => {
    const t = setInterval(() => setActiveTestimonial(p => (p + 1) % TESTIMONIALS.length), 4000);
    return () => clearInterval(t);
  }, []);

  const sendMessage = async (text) => {
    const userText = text || input.trim();
    if (!userText || loading) return;
    setInput("");
    const newMessages = [...messages, { role: "user", content: userText }];
    setMessages(newMessages);
    setLoading(true);
    try {
      const res = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${import.meta.env.CLAVE_DE_OPENAI}`,
        },
        body: JSON.stringify({
          model: "gpt-4o-mini",
          max_tokens: 1000,
          messages: [
            { role: "system", content: SYSTEM_PROMPT },
            ...newMessages.map(m => ({ role: m.role, content: m.content })),
          ],
        }),
      });
      const data = await res.json();
      const reply = data.choices?.[0]?.message?.content || "Disculpá, hubo un error. ¿Podés repetir?";
      setMessages([...newMessages, { role: "assistant", content: reply }]);
    } catch {
      setMessages([...newMessages, { role: "assistant", content: "Hubo un problema. ¿Podés intentar de nuevo?" }]);
    } finally {
      setLoading(false);
    }
  };

  const handleKey = (e) => {
    if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); sendMessage(); }
  };

  return (
    <div style={{
      minHeight: "100vh",
      background: "linear-gradient(160deg, #050d1f 0%, #0b1d3a 50%, #050d1f 100%)",
      fontFamily: "'Segoe UI', system-ui, sans-serif",
      color: "#fff",
    }}>
      {/* ── HERO SECTION ── */}
      <div style={{
        maxWidth: 900,
        margin: "0 auto",
        padding: "40px 20px 0",
        textAlign: "center",
      }}>
        {/* Badge */}
        <div style={{
          display: "inline-flex", alignItems: "center", gap: 6,
          background: "rgba(245,166,35,0.12)",
          border: "1px solid rgba(245,166,35,0.35)",
          borderRadius: 30, padding: "5px 14px",
          fontSize: 11, color: "#f5a623",
          letterSpacing: 1.2, textTransform: "uppercase",
          marginBottom: 20,
        }}>
          <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#f5a623", display: "inline-block" }} />
          Oferta especial · 47% de descuento
        </div>

        {/* Title */}
        <h1 style={{
          fontSize: "clamp(36px, 7vw, 64px)",
          fontWeight: 900,
          lineHeight: 1.05,
          margin: "0 0 8px",
          letterSpacing: -1,
        }}>
          <span style={{ color: "#fff" }}>IA</span>
          <span style={{ color: "#7eb8f7" }}> para el </span>
          <span style={{ color: "#fff" }}>TRABAJO</span>
        </h1>

        <p style={{
          fontSize: 16, color: "#93c5fd",
          margin: "0 auto 24px",
          maxWidth: 480, lineHeight: 1.5,
        }}>
          Guía práctica para hacer más con menos tiempo — sin ser programador, sin gastar dinero
        </p>

        {/* Stats row */}
        {[
          ["7", "Capítulos"],
          ["120", "Páginas"],
          ["50+", "Prompts listos"],
          ["7 días", "Garantía"],
        ].reduce((rows, item, i) => {
          if (i % 4 === 0) rows.push([]);
          rows[rows.length - 1].push(item);
          return rows;
        }, []).map((row, ri) => (
          <div key={ri} style={{ display: "flex", justifyContent: "center", gap: 12, marginBottom: 12, flexWrap: "wrap" }}>
            {row.map(([val, label]) => (
              <div key={label} style={{
                background: "rgba(255,255,255,0.05)",
                border: "1px solid rgba(255,255,255,0.08)",
                borderRadius: 10, padding: "10px 20px", textAlign: "center",
              }}>
                <div style={{ fontSize: 20, fontWeight: 800, color: "#f5a623" }}>{val}</div>
                <div style={{ fontSize: 10, color: "#6b7280", marginTop: 1 }}>{label}</div>
              </div>
            ))}
          </div>
        ))}
      </div>

      {/* ── MAIN CONTENT ── */}
      <div style={{
        maxWidth: 900,
        margin: "32px auto 0",
        padding: "0 20px 60px",
        display: "grid",
        gridTemplateColumns: "1fr 1fr",
        gap: 24,
      }}>

        {/* LEFT — Benefits + Testimonials */}
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>

          {/* Benefits card */}
          <div style={{
            background: "rgba(255,255,255,0.03)",
            border: "1px solid rgba(255,255,255,0.08)",
            borderRadius: 16, padding: "20px 22px",
          }}>
            <div style={{
              fontSize: 11, color: "#f5a623", fontWeight: 700,
              letterSpacing: 1, textTransform: "uppercase", marginBottom: 14,
            }}>
              📚 Lo que vas a aprender
            </div>
            {EBOOK.benefits.map((b, i) => (
              <div key={i} style={{
                display: "flex", gap: 10, alignItems: "flex-start",
                marginBottom: i < EBOOK.benefits.length - 1 ? 10 : 0,
              }}>
                <span style={{
                  color: "#22c55e", fontSize: 14, lineHeight: 1,
                  marginTop: 1, flexShrink: 0,
                }}>✓</span>
                <span style={{ fontSize: 13, color: "#d1d5db", lineHeight: 1.5 }}>{b}</span>
              </div>
            ))}

            {/* Bonus */}
            <div style={{
              marginTop: 16,
              background: "rgba(245,166,35,0.08)",
              border: "1px solid rgba(245,166,35,0.2)",
              borderRadius: 10, padding: "10px 14px",
              display: "flex", gap: 10, alignItems: "center",
            }}>
              <span style={{ fontSize: 18 }}>🎁</span>
              <div>
                <div style={{ fontSize: 11, color: "#f5a623", fontWeight: 700, marginBottom: 1 }}>BONUS INCLUIDO</div>
                <div style={{ fontSize: 12, color: "#d1d5db" }}>{EBOOK.bonus}</div>
              </div>
            </div>
          </div>

          {/* Testimonials */}
          <div style={{
            background: "rgba(255,255,255,0.03)",
            border: "1px solid rgba(255,255,255,0.08)",
            borderRadius: 16, padding: "20px 22px",
            minHeight: 130,
          }}>
            <div style={{
              fontSize: 11, color: "#7eb8f7", fontWeight: 700,
              letterSpacing: 1, textTransform: "uppercase", marginBottom: 14,
            }}>
              ⭐ Lo que dicen los lectores
            </div>
            {TESTIMONIALS.map((t, i) => (
              <div key={i} style={{
                display: i === activeTestimonial ? "block" : "none",
                animation: "fadeIn 0.5s ease",
              }}>
                <p style={{
                  fontSize: 13, color: "#d1d5db",
                  lineHeight: 1.6, fontStyle: "italic",
                  margin: "0 0 10px",
                }}>"{t.text}"</p>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <div style={{
                    width: 32, height: 32, borderRadius: "50%",
                    background: "linear-gradient(135deg, #1a4faf, #3b82f6)",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    fontSize: 13, fontWeight: 700,
                  }}>
                    {t.name[0]}
                  </div>
                  <div>
                    <div style={{ fontSize: 12, fontWeight: 700, color: "#fff" }}>{t.name}</div>
                    <div style={{ fontSize: 11, color: "#6b7280" }}>{t.role}</div>
                  </div>
                  <div style={{ marginLeft: "auto", color: "#f5a623", fontSize: 12 }}>★★★★★</div>
                </div>
              </div>
            ))}
            {/* Dots */}
            <div style={{ display: "flex", gap: 5, marginTop: 14, justifyContent: "center" }}>
              {TESTIMONIALS.map((_, i) => (
                <div key={i} onClick={() => setActiveTestimonial(i)} style={{
                  width: i === activeTestimonial ? 18 : 6,
                  height: 6, borderRadius: 3,
                  background: i === activeTestimonial ? "#f5a623" : "rgba(255,255,255,0.15)",
                  cursor: "pointer", transition: "all 0.3s",
                }} />
              ))}
            </div>
          </div>
        </div>

        {/* RIGHT — Chat + Buy */}
        <div style={{ display: "flex", flexDirection: "column", gap: 0 }}>

          {/* Chat header */}
          <div style={{
            background: "linear-gradient(135deg, #1a4faf, #2563eb)",
            borderRadius: "16px 16px 0 0",
            padding: "14px 18px",
            display: "flex", alignItems: "center", gap: 10,
          }}>
            <div style={{ position: "relative" }}>
              <div style={{
                width: 38, height: 38, borderRadius: "50%",
                background: "rgba(255,255,255,0.15)",
                display: "flex", alignItems: "center",
                justifyContent: "center", fontSize: 18,
              }}>🤖</div>
              <div style={{
                position: "absolute", bottom: 0, right: 0,
                width: 10, height: 10, borderRadius: "50%",
                background: "#22c55e", border: "2px solid #1a4faf",
              }} />
            </div>
            <div>
              <div style={{ fontWeight: 700, fontSize: 14 }}>Aria — Asesora Virtual</div>
              <div style={{ fontSize: 11, color: "rgba(255,255,255,0.7)" }}>● Disponible ahora · Responde al instante</div>
            </div>
          </div>

          {/* Messages */}
          <div style={{
            background: "#0f172a",
            padding: "16px 14px",
            height: 300,
            overflowY: "auto",
            display: "flex",
            flexDirection: "column",
            gap: 8,
          }}>
            {messages.map((m, i) => (
              <div key={i} style={{
                display: "flex",
                justifyContent: m.role === "user" ? "flex-end" : "flex-start",
              }}>
                <div style={{
                  maxWidth: "82%",
                  background: m.role === "user"
                    ? "linear-gradient(135deg, #1a4faf, #2563eb)"
                    : "rgba(255,255,255,0.07)",
                  border: m.role === "user" ? "none" : "1px solid rgba(255,255,255,0.08)",
                  color: "#fff",
                  padding: "9px 13px",
                  borderRadius: m.role === "user"
                    ? "14px 14px 3px 14px"
                    : "14px 14px 14px 3px",
                  fontSize: 13, lineHeight: 1.55,
                }}>
                  {m.content}
                </div>
              </div>
            ))}

            {loading && (
              <div style={{ display: "flex", justifyContent: "flex-start" }}>
                <div style={{
                  background: "rgba(255,255,255,0.07)",
                  border: "1px solid rgba(255,255,255,0.08)",
                  padding: "10px 14px",
                  borderRadius: "14px 14px 14px 3px",
                  display: "flex", gap: 4, alignItems: "center",
                }}>
                  {[0,1,2].map(d => (
                    <div key={d} style={{
                      width: 7, height: 7, borderRadius: "50%",
                      background: "#7eb8f7",
                      animation: "bounce 1.2s infinite",
                      animationDelay: `${d * 0.2}s`,
                    }} />
                  ))}
                </div>
              </div>
            )}

            {/* Quick replies */}
            {messages.length <= 2 && !loading && (
              <div style={{ display: "flex", flexWrap: "wrap", gap: 5, marginTop: 4 }}>
                {QUICK_REPLIES.map(q => (
                  <button key={q} onClick={() => sendMessage(q)} style={{
                    background: "transparent",
                    border: "1px solid rgba(59,130,246,0.4)",
                    color: "#7eb8f7",
                    borderRadius: 20, padding: "5px 11px",
                    fontSize: 11, cursor: "pointer",
                    transition: "all 0.15s",
                  }}>{q}</button>
                ))}
              </div>
            )}
            <div ref={bottomRef} />
          </div>

          {/* Input */}
          <div style={{
            background: "#0f172a",
            borderTop: "1px solid rgba(255,255,255,0.06)",
            padding: "10px 12px",
            display: "flex", gap: 8,
          }}>
            <input
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={handleKey}
              placeholder="Escribí tu pregunta..."
              style={{
                flex: 1,
                background: "rgba(255,255,255,0.06)",
                border: "1px solid rgba(255,255,255,0.1)",
                borderRadius: 24, padding: "9px 16px",
                fontSize: 13, color: "#fff", outline: "none",
              }}
            />
            <button
              onClick={() => sendMessage()}
              disabled={loading || !input.trim()}
              style={{
                background: loading || !input.trim()
                  ? "rgba(255,255,255,0.05)"
                  : "linear-gradient(135deg, #1a4faf, #3b82f6)",
                border: "none", borderRadius: "50%",
                width: 40, height: 40,
                cursor: loading || !input.trim() ? "not-allowed" : "pointer",
                display: "flex", alignItems: "center",
                justifyContent: "center", fontSize: 16,
                transition: "all 0.2s",
              }}
            >✈️</button>
          </div>

          {/* Price + CTA */}
          {!sold ? (
            <div style={{
              background: "rgba(255,255,255,0.03)",
              border: "1px solid rgba(255,255,255,0.08)",
              borderRadius: "0 0 16px 16px",
              padding: "16px 18px",
            }}>
              {/* Price */}
              <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 12 }}>
                <div>
                  <div style={{
                    fontSize: 11, color: "#6b7280",
                    textDecoration: "line-through", lineHeight: 1,
                  }}>
                    ${EBOOK.originalPrice.toLocaleString("es-AR")} ARS
                  </div>
                  <div style={{ display: "flex", alignItems: "baseline", gap: 8 }}>
                    <span style={{ fontSize: 30, fontWeight: 900, color: "#f5a623" }}>
                      ${EBOOK.price.toLocaleString("es-AR")}
                    </span>
                    <span style={{ fontSize: 11, color: "#6b7280" }}>ARS</span>
                  </div>
                </div>
                <div style={{
                  background: "#f5a623", color: "#000",
                  fontSize: 11, fontWeight: 800,
                  padding: "4px 10px", borderRadius: 20,
                }}>-47%</div>
                <div style={{ marginLeft: "auto", textAlign: "right" }}>
                  <div style={{ fontSize: 10, color: "#22c55e", fontWeight: 700 }}>✓ Garantía 7 días</div>
                  <div style={{ fontSize: 10, color: "#6b7280" }}>Devolución total</div>
                </div>
              </div>

              {/* Buy button */}
              <button
                onClick={() => window.open("https://mpago.la/23ZzPBw", "_blank")}
                style={{
                  width: "100%",
                  background: "linear-gradient(135deg, #f5a623, #d97706)",
                  color: "#000", border: "none",
                  borderRadius: 12, padding: "14px",
                  fontSize: 15, fontWeight: 800,
                  cursor: "pointer",
                  boxShadow: "0 4px 20px rgba(245,166,35,0.3)",
                  transition: "transform 0.1s",
                  letterSpacing: 0.3,
                }}
                onMouseDown={e => e.currentTarget.style.transform = "scale(0.98)"}
                onMouseUp={e => e.currentTarget.style.transform = "scale(1)"}
              >
                🛒 Comprar ahora — Acceso inmediato
              </button>

              {/* Trust signals */}
              <div style={{
                display: "flex", justifyContent: "center", gap: 16,
                marginTop: 10,
              }}>
                {["🔒 Pago seguro", "📧 Entrega inmediata", "↩️ 7 días de garantía"].map(s => (
                  <span key={s} style={{ fontSize: 10, color: "#4b5563" }}>{s}</span>
                ))}
              </div>
            </div>
          ) : (
            <div style={{
              background: "linear-gradient(135deg, rgba(34,197,94,0.1), rgba(21,128,61,0.1))",
              border: "1px solid rgba(34,197,94,0.3)",
              borderRadius: "0 0 16px 16px",
              padding: "24px",
              textAlign: "center",
            }}>
              <div style={{ fontSize: 40, marginBottom: 10 }}>🎉</div>
              <div style={{ fontSize: 18, fontWeight: 800, color: "#22c55e", marginBottom: 6 }}>
                ¡Compra realizada!
              </div>
              <div style={{ fontSize: 13, color: "#86efac" }}>
                Vas a recibir el ebook y el bonus en tu email en los próximos minutos.
              </div>
            </div>
          )}
        </div>
      </div>

      <style>{`
        @keyframes bounce {
          0%, 60%, 100% { transform: translateY(0); }
          30% { transform: translateY(-6px); }
        }
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(4px); }
          to { opacity: 1; transform: translateY(0); }
        }
        * { scrollbar-width: thin; scrollbar-color: rgba(255,255,255,0.1) transparent; }
        input::placeholder { color: rgba(255,255,255,0.25); }
        @media (max-width: 640px) {
          div[style*="grid-template-columns"] { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </div>
  );
}
