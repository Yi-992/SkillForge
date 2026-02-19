import { useEffect, useState } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { API_ENDPOINTS } from "./config/api.js";

function LessonPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();

  const [lesson, setLesson] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fromLearning = location.state?.fromLearning;
  const courseTitle = location.state?.courseTitle;

  useEffect(() => {
    async function loadLesson() {
      try {
        setLoading(true);
        setError(null);

        const res = await fetch(`${API_ENDPOINTS.lessons}/${id}`, {
          credentials: "include",
        });

        if (!res.ok) {
          const txt = await res.text();
          throw new Error(txt || "Failed to load lesson");
        }

        const data = await res.json();
        if (!data.lesson) throw new Error("No lesson returned");
        setLesson(data.lesson);
      } catch (err) {
        console.error("Load lesson error:", err);
        setError("Failed to load lesson.");
      } finally {
        setLoading(false);
      }
    }

    loadLesson();
  }, [id]);

  function handleBack() {
    if (fromLearning && courseTitle) {
      navigate("/home/learning", {
        state: {
          reopenCourse: true,
          courseTitle,
        },
      });
      return;
    }

    navigate(-1);
  }

  if (loading) {
    return (
      <div style={pageStyle}>
        <div style={statusCardStyle}>
          <div style={statusPulseStyle} />
          <div style={{ fontWeight: 700, color: "#0f172a" }}>Loading lesson content...</div>
          <div style={{ color: "#64748b", fontSize: "13px" }}>Preparing modules, notes, and media assets.</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div style={pageStyle}>
        <div style={statusCardStyle}>
          <div style={{ fontSize: "22px" }}>Unable to open this lesson</div>
          <div style={{ color: "#b91c1c", fontWeight: 700 }}>{error}</div>
          <button onClick={handleBack} style={backBtnStyle}>Back to Previous Page</button>
        </div>
      </div>
    );
  }

  if (!lesson) {
    return (
      <div style={pageStyle}>
        <div style={statusCardStyle}>
          <div style={{ fontSize: "22px" }}>Lesson not found</div>
          <button onClick={handleBack} style={backBtnStyle}>Go Back</button>
        </div>
      </div>
    );
  }

  const sections = lesson.content?.sections || [];

  return (
    <div style={pageStyle}>
      <div style={{ maxWidth: 940, width: "100%" }}>
        <button onClick={handleBack} style={backBtnStyle}>Back</button>

        <section style={heroCardStyle}>
          <div style={pillStyle}>Lesson Detail</div>
          <h1 style={titleStyle}>{lesson.title}</h1>
          <p style={subtitleStyle}>
            Work through each section in order, then return to your curriculum to continue progress.
          </p>
        </section>

        <section style={{ marginTop: "14px", display: "grid", gap: "12px" }}>
          {sections.length === 0 && (
            <div style={contentCardStyle}>No content sections found for this lesson yet.</div>
          )}

          {sections.map((s, i) => {
            if (s.type === "text") {
              return (
                <article key={i} style={contentCardStyle}>
                  <p style={textStyle}>{s.value}</p>
                </article>
              );
            }

            if (s.type === "image" && s.src) {
              return (
                <article key={i} style={contentCardStyle}>
                  <img src={s.src} alt={s.caption || "Lesson image"} style={imageStyle} />
                  {s.caption && <div style={captionStyle}>{s.caption}</div>}
                </article>
              );
            }

            if (s.type === "video" && s.src) {
              return (
                <article key={i} style={contentCardStyle}>
                  <div style={videoShellStyle}>
                    <iframe
                      src={s.src}
                      title="Lesson video"
                      width="100%"
                      height="420"
                      style={iframeStyle}
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                    />
                  </div>
                </article>
              );
            }

            if (s.type === "code") {
              return (
                <article key={i} style={contentCardStyle}>
                  <pre style={codeBlockStyle}>
                    <code>{s.value}</code>
                  </pre>
                </article>
              );
            }

            if (s.type === "link" && s.href) {
              return (
                <article key={i} style={contentCardStyle}>
                  <a href={s.href} target="_blank" rel="noreferrer" style={linkStyle}>
                    {s.text || s.href}
                  </a>
                </article>
              );
            }

            return null;
          })}
        </section>
      </div>
    </div>
  );
}

const pageStyle = {
  padding: "28px 20px 42px",
  display: "flex",
  justifyContent: "center",
};

const heroCardStyle = {
  background: "linear-gradient(140deg, rgba(248,250,252,0.96), rgba(226,232,240,0.9))",
  border: "1px solid rgba(148,163,184,0.3)",
  borderRadius: "20px",
  padding: "20px",
  boxShadow: "0 18px 34px rgba(15,23,42,0.09)",
};

const pillStyle = {
  display: "inline-flex",
  padding: "6px 10px",
  borderRadius: "999px",
  background: "rgba(14,165,233,0.14)",
  border: "1px solid rgba(14,165,233,0.28)",
  color: "#0369a1",
  fontSize: "12px",
  fontWeight: 800,
  letterSpacing: "0.03em",
  textTransform: "uppercase",
};

const titleStyle = {
  margin: "12px 0 8px",
  color: "#0f172a",
  fontSize: "34px",
  lineHeight: 1.1,
};

const subtitleStyle = {
  margin: 0,
  color: "#475569",
  lineHeight: 1.6,
};

const contentCardStyle = {
  background: "rgba(255,255,255,0.92)",
  borderRadius: "16px",
  border: "1px solid rgba(148,163,184,0.24)",
  boxShadow: "0 12px 28px rgba(15,23,42,0.07)",
  padding: "16px",
};

const statusCardStyle = {
  marginTop: "56px",
  width: "min(560px, 100%)",
  background: "rgba(255,255,255,0.92)",
  borderRadius: "18px",
  border: "1px solid rgba(148,163,184,0.32)",
  boxShadow: "0 18px 36px rgba(15,23,42,0.1)",
  padding: "22px",
  display: "grid",
  gap: "10px",
  textAlign: "center",
};

const statusPulseStyle = {
  width: "12px",
  height: "12px",
  borderRadius: "999px",
  margin: "0 auto",
  background: "#0284c7",
  boxShadow: "0 0 0 8px rgba(2,132,199,0.16)",
};

const backBtnStyle = {
  marginBottom: "12px",
  padding: "10px 14px",
  borderRadius: "10px",
  border: "1px solid rgba(37,99,235,0.25)",
  background: "#fff",
  color: "#1d4ed8",
  cursor: "pointer",
  fontWeight: 700,
};

const textStyle = {
  margin: 0,
  lineHeight: 1.8,
  fontSize: "16px",
  color: "#1e293b",
};

const imageStyle = {
  maxWidth: "100%",
  borderRadius: "12px",
  border: "1px solid rgba(148,163,184,0.22)",
  display: "block",
};

const captionStyle = {
  marginTop: "6px",
  fontSize: "12px",
  color: "#64748b",
};

const videoShellStyle = {
  borderRadius: "12px",
  overflow: "hidden",
  border: "1px solid rgba(148,163,184,0.26)",
};

const iframeStyle = {
  border: "none",
  display: "block",
};

const codeBlockStyle = {
  background: "#0f172a",
  color: "#e2e8f0",
  padding: "16px",
  borderRadius: "10px",
  overflowX: "auto",
  margin: 0,
  fontSize: "14px",
};

const linkStyle = {
  color: "#1d4ed8",
  fontWeight: 700,
  textDecoration: "none",
};

export default LessonPage;
