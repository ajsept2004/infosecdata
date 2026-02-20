import { useState, useEffect, useRef } from "react";

const useInView = (threshold = 0.15) => {
  const [isInView, setIsInView] = useState(false);
  const ref = useRef(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) { setIsInView(true); obs.disconnect(); } }, { threshold });
    obs.observe(el);
    return () => obs.disconnect();
  }, [threshold]);
  return [ref, isInView];
};

const AnimatedCounter = ({ end, suffix = "", duration = 2000 }) => {
  const [count, setCount] = useState(0);
  const [ref, inView] = useInView();
  useEffect(() => {
    if (!inView) return;
    let start = 0;
    const step = end / (duration / 16);
    const timer = setInterval(() => {
      start += step;
      if (start >= end) { setCount(end); clearInterval(timer); }
      else setCount(Math.floor(start));
    }, 16);
    return () => clearInterval(timer);
  }, [inView, end, duration]);
  return <span ref={ref}>{count}{suffix}</span>;
};

const ParticleCanvas = () => {
  const canvasRef = useRef(null);
  useEffect(() => {
    const c = canvasRef.current, ctx = c.getContext("2d");
    let w = c.width = window.innerWidth, h = c.height = window.innerHeight;
    const particles = Array.from({ length: 80 }, () => ({
      x: Math.random() * w, y: Math.random() * h,
      vx: (Math.random() - 0.5) * 0.5, vy: (Math.random() - 0.5) * 0.5,
      r: Math.random() * 2 + 0.5
    }));
    let animId;
    const draw = () => {
      ctx.clearRect(0, 0, w, h);
      particles.forEach((p, i) => {
        p.x += p.vx; p.y += p.vy;
        if (p.x < 0 || p.x > w) p.vx *= -1;
        if (p.y < 0 || p.y > h) p.vy *= -1;
        ctx.beginPath(); ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = "rgba(0,212,255,0.4)"; ctx.fill();
        for (let j = i + 1; j < particles.length; j++) {
          const dx = p.x - particles[j].x, dy = p.y - particles[j].y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < 150) {
            ctx.beginPath(); ctx.moveTo(p.x, p.y); ctx.lineTo(particles[j].x, particles[j].y);
            ctx.strokeStyle = `rgba(0,212,255,${0.15 * (1 - dist / 150)})`; ctx.lineWidth = 0.5; ctx.stroke();
          }
        }
      });
      animId = requestAnimationFrame(draw);
    };
    draw();
    const resize = () => { w = c.width = window.innerWidth; h = c.height = window.innerHeight; };
    window.addEventListener("resize", resize);
    return () => { cancelAnimationFrame(animId); window.removeEventListener("resize", resize); };
  }, []);
  return <canvas ref={canvasRef} style={{ position: "absolute", top: 0, left: 0, width: "100%", height: "100%", pointerEvents: "none" }} />;
};

const GlowOrb = ({ color, size, top, left, delay }) => (
  <div style={{
    position: "absolute", top, left, width: size, height: size, borderRadius: "50%",
    background: `radial-gradient(circle, ${color}33, transparent 70%)`,
    animation: `pulse ${4 + delay}s ease-in-out infinite alternate`,
    filter: "blur(40px)", pointerEvents: "none"
  }} />
);

const NavBar = ({ scrolled }) => {
  return (
    <nav style={{
      position: "fixed", top: 0, left: 0, right: 0, zIndex: 1000, padding: "0 40px",
      height: 72, display: "flex", alignItems: "center", justifyContent: "space-between",
      background: scrolled ? "rgba(8,10,20,0.92)" : "transparent",
      backdropFilter: scrolled ? "blur(20px)" : "none",
      borderBottom: scrolled ? "1px solid rgba(0,212,255,0.1)" : "none",
      transition: "all 0.5s cubic-bezier(0.4,0,0.2,1)"
    }}>
      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
        <div style={{
          width: 36, height: 36, borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center",
          background: "linear-gradient(135deg, #00d4ff, #7b2ff7)", position: "relative"
        }}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round">
            <rect x="3" y="11" width="18" height="11" rx="2" /><path d="M7 11V7a5 5 0 0110 0v4" />
          </svg>
        </div>
        <span style={{ fontSize: 20, fontWeight: 700, letterSpacing: "-0.02em", color: "#fff" }}>
          Infosec<span style={{ color: "#00d4ff" }}>Data</span>
        </span>
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: 32 }}>
        {["Services", "About", "Results", "Testimonials", "Contact"].map(item => (
          <a key={item} href={`#${item.toLowerCase()}`} style={{
            color: "rgba(255,255,255,0.7)", textDecoration: "none", fontSize: 14, fontWeight: 500,
            letterSpacing: "0.02em", transition: "color 0.3s", cursor: "pointer"
          }} onMouseEnter={e => e.target.style.color = "#00d4ff"} onMouseLeave={e => e.target.style.color = "rgba(255,255,255,0.7)"}>{item}</a>
        ))}
        <button style={{
          background: "linear-gradient(135deg, #00d4ff, #7b2ff7)", border: "none", color: "#fff",
          padding: "10px 24px", borderRadius: 8, fontSize: 14, fontWeight: 600, cursor: "pointer",
          transition: "transform 0.3s, box-shadow 0.3s"
        }} onMouseEnter={e => { e.target.style.transform = "translateY(-2px)"; e.target.style.boxShadow = "0 8px 30px rgba(0,212,255,0.4)"; }}
           onMouseLeave={e => { e.target.style.transform = ""; e.target.style.boxShadow = ""; }}>Get Started</button>
      </div>
    </nav>
  );
};

const HeroSection = () => {
  const [loaded, setLoaded] = useState(false);
  useEffect(() => { setTimeout(() => setLoaded(true), 100); }, []);
  return (
    <section style={{ position: "relative", minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", overflow: "hidden" }}>
      <ParticleCanvas />
      <GlowOrb color="#00d4ff" size="600px" top="-200px" left="-100px" delay={0} />
      <GlowOrb color="#7b2ff7" size="500px" top="200px" left="60%" delay={2} />
      <GlowOrb color="#00d4ff" size="400px" top="60%" left="20%" delay={1} />
      <div style={{ position: "relative", zIndex: 2, textAlign: "center", maxWidth: 900, padding: "0 24px" }}>
        <div style={{
          display: "inline-block", padding: "6px 20px", borderRadius: 50, marginBottom: 28,
          background: "rgba(0,212,255,0.08)", border: "1px solid rgba(0,212,255,0.2)",
          fontSize: 13, fontWeight: 600, letterSpacing: "0.08em", color: "#00d4ff", textTransform: "uppercase",
          opacity: loaded ? 1 : 0, transform: loaded ? "translateY(0)" : "translateY(20px)",
          transition: "all 0.8s cubic-bezier(0.4,0,0.2,1)"
        }}>🛡️ Next-Gen Cybersecurity & AI Solutions</div>
        <h1 style={{
          fontSize: "clamp(36px, 5.5vw, 72px)", fontWeight: 800, lineHeight: 1.08, margin: "0 0 24px",
          letterSpacing: "-0.03em",
          background: "linear-gradient(135deg, #ffffff 0%, #d0d0d0 40%, #00d4ff 100%)",
          WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
          opacity: loaded ? 1 : 0, transform: loaded ? "translateY(0)" : "translateY(30px)",
          transition: "all 1s cubic-bezier(0.4,0,0.2,1) 0.15s"
        }}>Securing Your Future with AI-Driven Intelligence</h1>
        <p style={{
          fontSize: "clamp(16px, 1.5vw, 20px)", color: "rgba(255,255,255,0.6)", maxWidth: 640, margin: "0 auto 40px",
          lineHeight: 1.7, fontWeight: 400,
          opacity: loaded ? 1 : 0, transform: loaded ? "translateY(0)" : "translateY(30px)",
          transition: "all 1s cubic-bezier(0.4,0,0.2,1) 0.3s"
        }}>We combine cutting-edge artificial intelligence with deep cybersecurity expertise to protect, detect, and respond to evolving digital threats.</p>
        <div style={{
          display: "flex", gap: 16, justifyContent: "center", flexWrap: "wrap",
          opacity: loaded ? 1 : 0, transform: loaded ? "translateY(0)" : "translateY(30px)",
          transition: "all 1s cubic-bezier(0.4,0,0.2,1) 0.45s"
        }}>
          <button style={{
            background: "linear-gradient(135deg, #00d4ff, #7b2ff7)", border: "none", color: "#fff",
            padding: "16px 40px", borderRadius: 12, fontSize: 16, fontWeight: 700, cursor: "pointer",
            transition: "all 0.4s cubic-bezier(0.4,0,0.2,1)", position: "relative", overflow: "hidden"
          }} onMouseEnter={e => { e.target.style.transform = "translateY(-3px) scale(1.03)"; e.target.style.boxShadow = "0 16px 48px rgba(0,212,255,0.35)"; }}
             onMouseLeave={e => { e.target.style.transform = ""; e.target.style.boxShadow = ""; }}>Free Consultation →</button>
          <button style={{
            background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.15)", color: "#fff",
            padding: "16px 40px", borderRadius: 12, fontSize: 16, fontWeight: 600, cursor: "pointer",
            backdropFilter: "blur(10px)", transition: "all 0.4s"
          }} onMouseEnter={e => { e.target.style.borderColor = "#00d4ff"; e.target.style.background = "rgba(0,212,255,0.06)"; }}
             onMouseLeave={e => { e.target.style.borderColor = "rgba(255,255,255,0.15)"; e.target.style.background = "rgba(255,255,255,0.04)"; }}>Our Services</button>
        </div>
        <div style={{
          display: "flex", gap: 48, justifyContent: "center", marginTop: 60,
          opacity: loaded ? 1 : 0, transform: loaded ? "translateY(0)" : "translateY(20px)",
          transition: "all 1s cubic-bezier(0.4,0,0.2,1) 0.6s"
        }}>
          {[["500+", "Clients Protected"], ["99.9%", "Uptime Guaranteed"], ["24/7", "Threat Monitoring"]].map(([v, l]) => (
            <div key={l} style={{ textAlign: "center" }}>
              <div style={{ fontSize: 24, fontWeight: 800, color: "#00d4ff" }}>{v}</div>
              <div style={{ fontSize: 12, color: "rgba(255,255,255,0.4)", marginTop: 4, letterSpacing: "0.05em" }}>{l}</div>
            </div>
          ))}
        </div>
      </div>
      <div style={{
        position: "absolute", bottom: 40, left: "50%", transform: "translateX(-50%)",
        animation: "bounce 2s ease-in-out infinite", opacity: 0.5
      }}>
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#00d4ff" strokeWidth="2"><path d="M7 13l5 5 5-5M7 6l5 5 5-5"/></svg>
      </div>
    </section>
  );
};

const services = [
  { icon: "🛡️", title: "Cybersecurity Consulting", desc: "End-to-end security assessments, architecture reviews, and strategic guidance to fortify your defences.", color: "#00d4ff" },
  { icon: "🤖", title: "AI-Powered Threat Detection", desc: "Machine learning models that identify and neutralise threats in real-time before they cause damage.", color: "#7b2ff7" },
  { icon: "📊", title: "Risk Assessment & Compliance", desc: "Comprehensive risk frameworks and compliance programs for GDPR, ISO 27001, SOC 2, and more.", color: "#00ffa3" },
  { icon: "🔍", title: "Penetration Testing", desc: "Advanced ethical hacking and vulnerability assessments to expose weaknesses before attackers do.", color: "#ff6b6b" },
  { icon: "🧠", title: "AI Strategy & Integration", desc: "Custom AI solutions designed to enhance your security operations and business intelligence.", color: "#ffd93d" },
  { icon: "🔄", title: "Incident Response", desc: "Rapid containment, recovery, and forensic analysis when security incidents occur.", color: "#ff9ff3" },
];

const ServiceCard = ({ icon, title, desc, color, index }) => {
  const [ref, inView] = useInView();
  const [hovered, setHovered] = useState(false);
  return (
    <div ref={ref} onMouseEnter={() => setHovered(true)} onMouseLeave={() => setHovered(false)} style={{
      position: "relative", padding: 36, borderRadius: 20,
      background: hovered ? "rgba(255,255,255,0.06)" : "rgba(255,255,255,0.02)",
      border: `1px solid ${hovered ? color + "55" : "rgba(255,255,255,0.06)"}`,
      transition: "all 0.5s cubic-bezier(0.4,0,0.2,1)",
      transform: inView ? (hovered ? "translateY(-8px)" : "translateY(0)") : "translateY(40px)",
      opacity: inView ? 1 : 0,
      transitionDelay: `${index * 0.1}s`,
      cursor: "pointer", overflow: "hidden"
    }}>
      <div style={{
        position: "absolute", top: -50, right: -50, width: 150, height: 150, borderRadius: "50%",
        background: `radial-gradient(circle, ${color}15, transparent 70%)`,
        transition: "all 0.5s", transform: hovered ? "scale(1.5)" : "scale(1)"
      }} />
      <div style={{
        width: 56, height: 56, borderRadius: 16, display: "flex", alignItems: "center", justifyContent: "center",
        background: `${color}12`, fontSize: 28, marginBottom: 20, position: "relative",
        transition: "transform 0.4s", transform: hovered ? "scale(1.1) rotate(5deg)" : ""
      }}>{icon}</div>
      <h3 style={{ fontSize: 20, fontWeight: 700, color: "#fff", marginBottom: 10, position: "relative" }}>{title}</h3>
      <p style={{ fontSize: 14, color: "rgba(255,255,255,0.5)", lineHeight: 1.7, margin: 0, position: "relative" }}>{desc}</p>
      <div style={{
        display: "flex", alignItems: "center", gap: 8, marginTop: 20, color, fontSize: 14, fontWeight: 600,
        opacity: hovered ? 1 : 0, transform: hovered ? "translateX(0)" : "translateX(-10px)",
        transition: "all 0.4s", position: "relative"
      }}>Learn more <span style={{ transition: "transform 0.3s", display: "inline-block", transform: hovered ? "translateX(4px)" : "" }}>→</span></div>
    </div>
  );
};

const ServicesSection = () => {
  const [ref, inView] = useInView();
  return (
    <section id="services" style={{ padding: "120px 40px", position: "relative" }}>
      <GlowOrb color="#7b2ff7" size="500px" top="0" left="-200px" delay={1} />
      <div style={{ maxWidth: 1200, margin: "0 auto", position: "relative", zIndex: 2 }}>
        <div ref={ref} style={{ textAlign: "center", marginBottom: 64, opacity: inView ? 1 : 0, transform: inView ? "translateY(0)" : "translateY(30px)", transition: "all 0.8s cubic-bezier(0.4,0,0.2,1)" }}>
          <div style={{ fontSize: 13, fontWeight: 600, letterSpacing: "0.1em", color: "#00d4ff", textTransform: "uppercase", marginBottom: 16 }}>What We Do</div>
          <h2 style={{ fontSize: "clamp(28px, 3.5vw, 48px)", fontWeight: 800, color: "#fff", marginBottom: 16, letterSpacing: "-0.02em" }}>Comprehensive Security Solutions</h2>
          <p style={{ color: "rgba(255,255,255,0.5)", maxWidth: 550, margin: "0 auto", lineHeight: 1.7 }}>From threat detection to AI integration, we provide full-spectrum cybersecurity services tailored to your organisation.</p>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: 24 }}>
          {services.map((s, i) => <ServiceCard key={s.title} {...s} index={i} />)}
        </div>
      </div>
    </section>
  );
};

const StatsSection = () => {
  const [ref, inView] = useInView();
  const stats = [
    { value: 500, suffix: "+", label: "Clients Protected", icon: "🏢" },
    { value: 15, suffix: "M+", label: "Threats Blocked", icon: "🚫" },
    { value: 99, suffix: ".9%", label: "Client Retention", icon: "⭐" },
    { value: 12, suffix: "+", label: "Years Experience", icon: "📅" },
  ];
  return (
    <section id="results" style={{ padding: "80px 40px", position: "relative" }}>
      <div ref={ref} style={{
        maxWidth: 1200, margin: "0 auto", borderRadius: 24, padding: "64px 40px",
        background: "linear-gradient(135deg, rgba(0,212,255,0.06), rgba(123,47,247,0.06))",
        border: "1px solid rgba(0,212,255,0.1)", position: "relative", overflow: "hidden",
        opacity: inView ? 1 : 0, transform: inView ? "translateY(0)" : "translateY(30px)",
        transition: "all 0.8s cubic-bezier(0.4,0,0.2,1)"
      }}>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 40, position: "relative", zIndex: 2 }}>
          {stats.map((s, i) => (
            <div key={s.label} style={{ textAlign: "center", opacity: inView ? 1 : 0, transform: inView ? "translateY(0)" : "translateY(20px)", transition: `all 0.8s ${i * 0.15}s` }}>
              <div style={{ fontSize: 36, marginBottom: 12 }}>{s.icon}</div>
              <div style={{ fontSize: 48, fontWeight: 800, color: "#00d4ff", lineHeight: 1 }}>
                <AnimatedCounter end={s.value} />{s.suffix.replace(/^\d+/, "")}
              </div>
              <div style={{ fontSize: 14, color: "rgba(255,255,255,0.5)", marginTop: 8, letterSpacing: "0.03em" }}>{s.label}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

const AboutSection = () => {
  const [ref, inView] = useInView();
  return (
    <section id="about" style={{ padding: "120px 40px", position: "relative" }}>
      <GlowOrb color="#00d4ff" size="400px" top="20%" left="70%" delay={2} />
      <div ref={ref} style={{ maxWidth: 1200, margin: "0 auto", display: "grid", gridTemplateColumns: "1fr 1fr", gap: 80, alignItems: "center", position: "relative", zIndex: 2 }}>
        <div style={{ opacity: inView ? 1 : 0, transform: inView ? "translateX(0)" : "translateX(-40px)", transition: "all 1s cubic-bezier(0.4,0,0.2,1)" }}>
          <div style={{ fontSize: 13, fontWeight: 600, letterSpacing: "0.1em", color: "#7b2ff7", textTransform: "uppercase", marginBottom: 16 }}>About Us</div>
          <h2 style={{ fontSize: "clamp(28px, 3vw, 44px)", fontWeight: 800, color: "#fff", lineHeight: 1.15, marginBottom: 24, letterSpacing: "-0.02em" }}>
            Where Cybersecurity Meets Artificial Intelligence
          </h2>
          <p style={{ color: "rgba(255,255,255,0.55)", lineHeight: 1.8, marginBottom: 20, fontSize: 16 }}>
            Founded by a team of security veterans and AI researchers, InfosecData sits at the cutting edge of digital protection. We don't just respond to threats — we predict and prevent them using proprietary machine learning models.
          </p>
          <p style={{ color: "rgba(255,255,255,0.55)", lineHeight: 1.8, fontSize: 16, marginBottom: 32 }}>
            Our mission is to democratise enterprise-grade security, making advanced AI-powered protection accessible to organisations of all sizes.
          </p>
          <div style={{ display: "flex", gap: 24 }}>
            {[["ISO 27001", "Certified"], ["SOC 2", "Compliant"], ["CREST", "Accredited"]].map(([t, s]) => (
              <div key={t} style={{ padding: "14px 20px", borderRadius: 12, background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)" }}>
                <div style={{ fontSize: 15, fontWeight: 700, color: "#fff" }}>{t}</div>
                <div style={{ fontSize: 12, color: "rgba(255,255,255,0.4)" }}>{s}</div>
              </div>
            ))}
          </div>
        </div>
        <div style={{ opacity: inView ? 1 : 0, transform: inView ? "translateX(0)" : "translateX(40px)", transition: "all 1s cubic-bezier(0.4,0,0.2,1) 0.2s" }}>
          <div style={{
            borderRadius: 24, padding: 40, position: "relative",
            background: "linear-gradient(135deg, rgba(0,212,255,0.08), rgba(123,47,247,0.08))",
            border: "1px solid rgba(0,212,255,0.15)"
          }}>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24 }}>
              {[
                { n: "Threat Intelligence", p: 95 }, { n: "AI Accuracy", p: 99 },
                { n: "Response Time", p: 98 }, { n: "Client Satisfaction", p: 97 }
              ].map((item, i) => (
                <div key={item.n}>
                  <div style={{ fontSize: 13, color: "rgba(255,255,255,0.5)", marginBottom: 8 }}>{item.n}</div>
                  <div style={{ height: 6, borderRadius: 3, background: "rgba(255,255,255,0.06)", overflow: "hidden" }}>
                    <div style={{
                      height: "100%", borderRadius: 3,
                      background: i % 2 === 0 ? "linear-gradient(90deg, #00d4ff, #7b2ff7)" : "linear-gradient(90deg, #7b2ff7, #00d4ff)",
                      width: inView ? `${item.p}%` : "0%",
                      transition: `width 1.5s cubic-bezier(0.4,0,0.2,1) ${0.5 + i * 0.2}s`
                    }} />
                  </div>
                  <div style={{ fontSize: 20, fontWeight: 700, color: "#fff", marginTop: 6 }}>{item.p}%</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

const testimonials = [
  { name: "Sarah Chen", role: "CTO, FinanceCore", text: "InfosecData's AI-driven approach transformed our security posture. Threat detection time dropped by 90% within the first quarter.", avatar: "SC" },
  { name: "James McAllister", role: "CISO, MedTech Global", text: "Their penetration testing uncovered critical vulnerabilities our previous provider missed entirely. Exceptional expertise and professionalism.", avatar: "JM" },
  { name: "Priya Sharma", role: "VP Engineering, DataFlow", text: "The AI integration into our SOC operations was seamless. We now detect and respond to threats autonomously around the clock.", avatar: "PS" },
];

const TestimonialsSection = () => {
  const [ref, inView] = useInView();
  const [active, setActive] = useState(0);
  useEffect(() => {
    const t = setInterval(() => setActive(p => (p + 1) % testimonials.length), 5000);
    return () => clearInterval(t);
  }, []);
  return (
    <section id="testimonials" style={{ padding: "120px 40px", position: "relative" }}>
      <div style={{ maxWidth: 1200, margin: "0 auto", position: "relative", zIndex: 2 }}>
        <div ref={ref} style={{ textAlign: "center", marginBottom: 64, opacity: inView ? 1 : 0, transform: inView ? "translateY(0)" : "translateY(30px)", transition: "all 0.8s" }}>
          <div style={{ fontSize: 13, fontWeight: 600, letterSpacing: "0.1em", color: "#00ffa3", textTransform: "uppercase", marginBottom: 16 }}>Testimonials</div>
          <h2 style={{ fontSize: "clamp(28px, 3.5vw, 48px)", fontWeight: 800, color: "#fff", letterSpacing: "-0.02em" }}>Trusted by Industry Leaders</h2>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 24 }}>
          {testimonials.map((t, i) => (
            <div key={t.name} onClick={() => setActive(i)} style={{
              padding: 36, borderRadius: 20, cursor: "pointer",
              background: active === i ? "rgba(0,212,255,0.06)" : "rgba(255,255,255,0.02)",
              border: `1px solid ${active === i ? "rgba(0,212,255,0.2)" : "rgba(255,255,255,0.06)"}`,
              transform: inView ? (active === i ? "translateY(-4px) scale(1.02)" : "translateY(0)") : "translateY(30px)",
              opacity: inView ? 1 : 0, transition: `all 0.5s cubic-bezier(0.4,0,0.2,1) ${i * 0.1}s`
            }}>
              <div style={{ display: "flex", gap: 4, marginBottom: 20 }}>
                {[...Array(5)].map((_, j) => <span key={j} style={{ color: "#ffd93d", fontSize: 16 }}>★</span>)}
              </div>
              <p style={{ color: "rgba(255,255,255,0.6)", lineHeight: 1.7, fontSize: 15, marginBottom: 24, fontStyle: "italic" }}>"{t.text}"</p>
              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <div style={{
                  width: 44, height: 44, borderRadius: 12,
                  background: `linear-gradient(135deg, #00d4ff, #7b2ff7)`,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: 14, fontWeight: 700, color: "#fff"
                }}>{t.avatar}</div>
                <div>
                  <div style={{ fontSize: 15, fontWeight: 700, color: "#fff" }}>{t.name}</div>
                  <div style={{ fontSize: 13, color: "rgba(255,255,255,0.4)" }}>{t.role}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
        <div style={{ display: "flex", justifyContent: "center", gap: 8, marginTop: 32 }}>
          {testimonials.map((_, i) => (
            <div key={i} onClick={() => setActive(i)} style={{
              width: active === i ? 32 : 8, height: 8, borderRadius: 4, cursor: "pointer",
              background: active === i ? "#00d4ff" : "rgba(255,255,255,0.15)",
              transition: "all 0.4s"
            }} />
          ))}
        </div>
      </div>
    </section>
  );
};

const ContactSection = () => {
  const [ref, inView] = useInView();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [focused, setFocused] = useState(null);
  const inputStyle = (field) => ({
    width: "100%", padding: "16px 20px", borderRadius: 12, fontSize: 15,
    background: "rgba(255,255,255,0.04)", color: "#fff",
    border: `1px solid ${focused === field ? "#00d4ff" : "rgba(255,255,255,0.08)"}`,
    outline: "none", transition: "all 0.3s", boxSizing: "border-box"
  });
  return (
    <section id="contact" style={{ padding: "120px 40px", position: "relative" }}>
      <GlowOrb color="#7b2ff7" size="400px" top="30%" left="80%" delay={3} />
      <div ref={ref} style={{
        maxWidth: 700, margin: "0 auto", textAlign: "center", position: "relative", zIndex: 2,
        opacity: inView ? 1 : 0, transform: inView ? "translateY(0)" : "translateY(30px)",
        transition: "all 0.8s cubic-bezier(0.4,0,0.2,1)"
      }}>
        <div style={{ fontSize: 13, fontWeight: 600, letterSpacing: "0.1em", color: "#ff6b6b", textTransform: "uppercase", marginBottom: 16 }}>Get In Touch</div>
        <h2 style={{ fontSize: "clamp(28px, 3.5vw, 48px)", fontWeight: 800, color: "#fff", marginBottom: 16, letterSpacing: "-0.02em" }}>Ready to Secure Your Future?</h2>
        <p style={{ color: "rgba(255,255,255,0.5)", marginBottom: 48, lineHeight: 1.7 }}>Book a free consultation with our team and discover how AI-powered security can protect your organisation.</p>
        <div style={{ display: "grid", gap: 16, textAlign: "left" }}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
            <input placeholder="Your Name" value={name} onChange={e => setName(e.target.value)} onFocus={() => setFocused("name")} onBlur={() => setFocused(null)} style={inputStyle("name")} />
            <input placeholder="Email Address" value={email} onChange={e => setEmail(e.target.value)} onFocus={() => setFocused("email")} onBlur={() => setFocused(null)} style={inputStyle("email")} />
          </div>
          <textarea placeholder="Tell us about your security needs..." rows={5} value={message} onChange={e => setMessage(e.target.value)} onFocus={() => setFocused("msg")} onBlur={() => setFocused(null)} style={{ ...inputStyle("msg"), resize: "vertical", fontFamily: "inherit" }} />
          <button style={{
            width: "100%", padding: "18px", borderRadius: 12, border: "none", cursor: "pointer",
            background: "linear-gradient(135deg, #00d4ff, #7b2ff7)", color: "#fff",
            fontSize: 16, fontWeight: 700, letterSpacing: "0.02em",
            transition: "all 0.4s cubic-bezier(0.4,0,0.2,1)"
          }} onMouseEnter={e => { e.target.style.transform = "translateY(-2px)"; e.target.style.boxShadow = "0 16px 48px rgba(0,212,255,0.3)"; }}
             onMouseLeave={e => { e.target.style.transform = ""; e.target.style.boxShadow = ""; }}>Send Message →</button>
        </div>
      </div>
    </section>
  );
};

const Footer = () => (
  <footer style={{
    padding: "60px 40px 32px", borderTop: "1px solid rgba(255,255,255,0.06)",
    background: "rgba(0,0,0,0.3)"
  }}>
    <div style={{ maxWidth: 1200, margin: "0 auto" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "start", flexWrap: "wrap", gap: 40, marginBottom: 48 }}>
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 16 }}>
            <div style={{ width: 32, height: 32, borderRadius: 8, background: "linear-gradient(135deg, #00d4ff, #7b2ff7)", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0110 0v4"/></svg>
            </div>
            <span style={{ fontSize: 18, fontWeight: 700, color: "#fff" }}>Infosec<span style={{ color: "#00d4ff" }}>Data</span></span>
          </div>
          <p style={{ color: "rgba(255,255,255,0.4)", fontSize: 14, maxWidth: 300, lineHeight: 1.7 }}>Next-generation cybersecurity and AI consulting, protecting organisations worldwide.</p>
        </div>
        {[
          { title: "Services", links: ["Cybersecurity", "AI Solutions", "Compliance", "Pen Testing"] },
          { title: "Company", links: ["About Us", "Careers", "Blog", "Contact"] },
          { title: "Legal", links: ["Privacy Policy", "Terms of Service", "Cookie Policy"] },
        ].map(col => (
          <div key={col.title}>
            <div style={{ fontSize: 14, fontWeight: 700, color: "#fff", marginBottom: 16 }}>{col.title}</div>
            {col.links.map(l => (
              <div key={l} style={{ fontSize: 14, color: "rgba(255,255,255,0.4)", marginBottom: 10, cursor: "pointer", transition: "color 0.3s" }}
                   onMouseEnter={e => e.target.style.color = "#00d4ff"} onMouseLeave={e => e.target.style.color = "rgba(255,255,255,0.4)"}>{l}</div>
            ))}
          </div>
        ))}
      </div>
      <div style={{ borderTop: "1px solid rgba(255,255,255,0.06)", paddingTop: 24, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <p style={{ color: "rgba(255,255,255,0.3)", fontSize: 13 }}>© 2026 InfosecData. All rights reserved.</p>
        <div style={{ display: "flex", gap: 16 }}>
          {["LinkedIn", "X", "GitHub"].map(s => (
            <span key={s} style={{ color: "rgba(255,255,255,0.3)", fontSize: 13, cursor: "pointer", transition: "color 0.3s" }}
                  onMouseEnter={e => e.target.style.color = "#00d4ff"} onMouseLeave={e => e.target.style.color = "rgba(255,255,255,0.3)"}>{s}</span>
          ))}
        </div>
      </div>
    </div>
  </footer>
);

export default function App() {
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    const h = () => setScrolled(window.scrollY > 50);
    window.addEventListener("scroll", h);
    return () => window.removeEventListener("scroll", h);
  }, []);
  return (
    <div style={{
      minHeight: "100vh", background: "#080a14", color: "#fff",
      fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
      overflowX: "hidden", position: "relative"
    }}>
      <style>{`
        @keyframes pulse { 0% { opacity: 0.3; transform: scale(1); } 100% { opacity: 0.7; transform: scale(1.2); } }
        @keyframes bounce { 0%, 100% { transform: translateX(-50%) translateY(0); } 50% { transform: translateX(-50%) translateY(10px); } }
        ::selection { background: rgba(0,212,255,0.3); }
        * { margin: 0; padding: 0; box-sizing: border-box; }
        html { scroll-behavior: smooth; }
        ::-webkit-scrollbar { width: 8px; }
        ::-webkit-scrollbar-track { background: #080a14; }
        ::-webkit-scrollbar-thumb { background: rgba(0,212,255,0.3); border-radius: 4px; }
        input::placeholder, textarea::placeholder { color: rgba(255,255,255,0.3); }
      `}</style>
      <NavBar scrolled={scrolled} />
      <HeroSection />
      <ServicesSection />
      <StatsSection />
      <AboutSection />
      <TestimonialsSection />
      <ContactSection />
      <Footer />
    </div>
  );
}