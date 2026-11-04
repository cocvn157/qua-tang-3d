/**
 * ============================================================================
 * QUÀ TẶNG 3D & WEB TỎ TÌNH, SINH NHẬT, XIN LỖI NGƯỜI YÊU (QUA-TANG-3D)
 * 100% Client-Side • 3D Particle Heart & Fireworks • WebAudio Music Box
 * ============================================================================
 */

(function () {
  "use strict";

  const VIP_KEY = "qua_tang_3d_vip_unlocked";
  const OWNER_KEY = "qua_tang_3d_owner_cfg";

  const TEMPLATES = [
    "Từ ngày gặp em, thế giới của anh bỗng rực rỡ hơn ngàn vì sao. Cảm ơn em đã đến bên anh. Đồng ý làm người yêu anh mãi mãi nhé! ❤️",
    "Cảm ơn người thương đã luôn nắm chặt tay đi qua bao nắng mưa. Chúc tình yêu của chúng mình mãi ngọt ngào như ngày đầu tiên! 💍",
    "Chúc mừng sinh nhật công chúa! Chúc em tuổi mới luôn xinh đẹp rạng ngời, bình an, hạnh phúc và mãi là niềm vui lớn nhất của anh! 🎂",
    "Chúc mừng sinh nhật! Chúc bạn tuổi mới tiền vào như nước sông Đà, công việc thuận buồm xuôi gió, vạn sự như ý! 🎉",
    "Biết lỗi thật rồi mà 🥺 Đừng giận nữa nhé, tối nay dẫn đi uống trà sữa full topping và ăn món ngon bù đắp nha! 🥰",
    "Chúc một nửa thế giới yêu thương luôn rạng rỡ như hoa hướng dương, mỗi ngày trôi qua đều ngập tràn tiếng cười và hạnh phúc! 🌹"
  ];

  const state = {
    mode: "love",
    toName: "Bảo Ngọc",
    fromName: "Hoàng Quân",
    message: TEMPLATES[0],
    yesScale: 1,
    dodgeCount: 0,
    musicPlaying: false,
    musicTimer: null,
    audioCtx: null,
    fireworksBurst: 0
  };

  // --------------------------------------------------------------------------
  // 1. OWNER VIETQR CONFIG & VIP CHECK
  // --------------------------------------------------------------------------
  function getOwnerConfig() {
    const cfg = {
      bankId: "MB",
      accountNo: "0988888888",
      accountName: "NGUYEN VAN A",
      price: 19000
    };
    try {
      const saved = JSON.parse(localStorage.getItem(OWNER_KEY) || "null");
      if (saved) Object.assign(cfg, saved);
    } catch (e) {}

    const params = new URLSearchParams(window.location.search);
    if (params.get("bank")) cfg.bankId = params.get("bank");
    if (params.get("acc")) cfg.accountNo = params.get("acc");
    if (params.get("name")) cfg.accountName = params.get("name");
    if (params.get("price")) cfg.price = parseInt(params.get("price"), 10) || 19000;
    return cfg;
  }

  function isVip() {
    return localStorage.getItem(VIP_KEY) === "true";
  }

  function updateVipUI() {
    const vip = isVip();
    const watermark = document.getElementById("freeWatermarkBar");
    const badge = document.getElementById("vipBadgeStatus");
    const btnVip = document.getElementById("btnOpenVipModal");

    if (watermark) watermark.style.display = vip ? "none" : "block";
    if (badge) {
      badge.textContent = vip ? "👑 Đã Mở Khóa VIP" : "🌟 Bản Miễn Phí";
      if (vip) {
        badge.style.borderColor = "#10b981";
        badge.style.color = "#6ee7b7";
      }
    }
    if (btnVip && vip) {
      btnVip.textContent = "👑 VIP Đã Kích Hoạt";
    }
  }

  // --------------------------------------------------------------------------
  // 2. WEBAUDIO ROMANTIC MUSIC BOX & HAPPY BIRTHDAY SYNTHESIZER
  // --------------------------------------------------------------------------
  function playNote(freq, durationMs, delayMs) {
    if (!state.audioCtx) {
      const AudioContextClass = window.AudioContext || window.webkitAudioContext;
      if (!AudioContextClass) return;
      state.audioCtx = new AudioContextClass();
    }
    if (state.audioCtx.state === "suspended") {
      state.audioCtx.resume();
    }

    setTimeout(() => {
      if (!state.audioCtx) return;
      const osc = state.audioCtx.createOscillator();
      const gain = state.audioCtx.createGain();
      osc.type = "sine";
      osc.frequency.setValueAtTime(freq, state.audioCtx.currentTime);

      gain.gain.setValueAtTime(0.001, state.audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.12, state.audioCtx.currentTime + 0.04);
      gain.gain.exponentialRampToValueAtTime(0.0001, state.audioCtx.currentTime + durationMs / 1000);

      osc.connect(gain);
      gain.connect(state.audioCtx.destination);
      osc.start();
      osc.stop(state.audioCtx.currentTime + durationMs / 1000 + 0.05);
    }, delayMs);
  }

  function playMelodyLoop() {
    // Romantic Music Box Arpeggio (C major / A minor / F / G) or Happy Birthday
    const birthdayNotes = [
      [261.63, 350], [261.63, 350], [293.66, 600], [261.63, 600], [349.23, 600], [329.63, 1000],
      [261.63, 350], [261.63, 350], [293.66, 600], [261.63, 600], [392.00, 600], [349.23, 1000]
    ];
    const loveNotes = [
      [523.25, 450], [659.25, 450], [783.99, 450], [1046.5, 700],
      [440.00, 450], [523.25, 450], [659.25, 450], [880.00, 700],
      [349.23, 450], [440.00, 450], [523.25, 450], [698.46, 700],
      [392.00, 450], [493.88, 450], [587.33, 450], [783.99, 800]
    ];

    const seq = state.mode === "birthday" ? birthdayNotes : loveNotes;
    let offset = 0;
    seq.forEach(([freq, dur]) => {
      playNote(freq, dur, offset);
      offset += dur * 0.85;
    });
  }

  function toggleMusic() {
    const btn = document.getElementById("btnToggleMusic");
    if (state.musicPlaying) {
      state.musicPlaying = false;
      if (state.musicTimer) clearInterval(state.musicTimer);
      btn.textContent = "🎵 Bật Nhạc Lãng Mạn";
    } else {
      state.musicPlaying = true;
      btn.textContent = "🔊 Đang Phát Nhạc (Bấm Để Tắt)";
      playMelodyLoop();
      state.musicTimer = setInterval(() => {
        if (state.musicPlaying) playMelodyLoop();
      }, 7200);
    }
  }

  // --------------------------------------------------------------------------
  // 3. 3D PARTICLE HEART & FIREWORKS CANVAS ENGINE
  // --------------------------------------------------------------------------
  function initStageCanvas() {
    const canvas = document.getElementById("stage-canvas");
    if (!canvas) return;
    const ctx = canvas.getContext("2d");

    let W = (canvas.width = window.innerWidth);
    let H = (canvas.height = window.innerHeight);
    window.addEventListener("resize", () => {
      W = canvas.width = window.innerWidth;
      H = canvas.height = window.innerHeight;
    });

    // Parametric Heart Points + Floating Stars
    const heartPoints = [];
    const numPoints = 95;
    for (let i = 0; i < numPoints; i++) {
      const t = (Math.PI * 2 * i) / numPoints;
      const x = 16 * Math.pow(Math.sin(t), 3);
      const y = -(13 * Math.cos(t) - 5 * Math.cos(2 * t) - 2 * Math.cos(3 * t) - Math.cos(4 * t));
      heartPoints.push({
        bx: x,
        by: y,
        size: Math.random() * 2.2 + 1.2,
        phase: Math.random() * Math.PI * 2
      });
    }

    const fireworks = [];

    window.triggerStageFireworks = function () {
      for (let b = 0; b < 4; b++) {
        const cx = W * (0.25 + Math.random() * 0.5);
        const cy = H * (0.2 + Math.random() * 0.4);
        const colors = ["#ff2a85", "#fde047", "#38bdf8", "#a855f7", "#4ade80"];
        const color = colors[b % colors.length];
        for (let i = 0; i < 28; i++) {
          const angle = (Math.PI * 2 * i) / 28;
          const speed = 1.8 + Math.random() * 3.5;
          fireworks.push({
            x: cx,
            y: cy,
            vx: Math.cos(angle) * speed,
            vy: Math.sin(angle) * speed,
            alpha: 1,
            color
          });
        }
      }
    };

    let tick = 0;
    function renderFrame() {
      ctx.clearRect(0, 0, W, H);
      tick += 0.03;

      // Draw subtle glowing 3D heart aura in center background
      const scale = Math.min(W, H) / 42 + Math.sin(tick * 2) * 0.65;
      const centerX = W / 2;
      const centerY = H * 0.42;

      for (let i = 0; i < heartPoints.length; i++) {
        const p = heartPoints[i];
        const px = centerX + p.bx * scale + Math.cos(tick + p.phase) * 3;
        const py = centerY + p.by * scale + Math.sin(tick + p.phase) * 3;
        ctx.beginPath();
        ctx.arc(px, py, p.size, 0, Math.PI * 2);
        ctx.fillStyle = i % 2 === 0 ? "rgba(255, 42, 133, 0.48)" : "rgba(253, 230, 138, 0.45)";
        ctx.fill();
      }

      // Update & draw fireworks particles
      for (let i = fireworks.length - 1; i >= 0; i--) {
        const fw = fireworks[i];
        fw.x += fw.vx;
        fw.y += fw.vy;
        fw.vy += 0.04; // gravity
        fw.alpha -= 0.016;
        if (fw.alpha <= 0) {
          fireworks.splice(i, 1);
          continue;
        }
        ctx.beginPath();
        ctx.arc(fw.x, fw.y, 2.6, 0, Math.PI * 2);
        ctx.fillStyle = fw.color;
        ctx.globalAlpha = Math.max(0, fw.alpha);
        ctx.fill();
        ctx.globalAlpha = 1;
      }

      requestAnimationFrame(renderFrame);
    }
    requestAnimationFrame(renderFrame);
  }

  // --------------------------------------------------------------------------
  // 4. TYPEWRITER TEXT EFFECT & STAGE RENDERER FOR ALL 4 MODES
  // --------------------------------------------------------------------------
  let typewriterTimer = null;
  function runTypewriter(text) {
    const box = document.getElementById("stageMessageText");
    if (!box) return;
    if (typewriterTimer) clearInterval(typewriterTimer);
    box.textContent = "";
    let idx = 0;
    const str = text || "";
    typewriterTimer = setInterval(() => {
      box.textContent += str.charAt(idx);
      idx++;
      if (idx >= str.length) {
        clearInterval(typewriterTimer);
      }
    }, 22);
  }

  function renderStageMode() {
    state.yesScale = 1;
    state.dodgeCount = 0;

    // Sync active tab pill
    document.querySelectorAll(".mode-tab-btn").forEach((btn) => {
      btn.classList.toggle("active", btn.getAttribute("data-mode") === state.mode);
    });

    const pill = document.getElementById("stageRecipientPill");
    const heading = document.getElementById("stageMainHeading");
    const visual = document.getElementById("stageCenterVisual");
    const arena = document.getElementById("stageActionArena");

    pill.textContent = `💌 Gửi Tới: ${state.toName} Yêu Thương (Từ: ${state.fromName})`;
    runTypewriter(state.message);

    if (state.mode === "love") {
      heading.textContent = `Làm Người Yêu Của ${state.fromName} Nhé, ${state.toName}? ❤️`;
      visual.innerHTML = `<div class="heart-3d-emblem">💖</div>`;
      arena.innerHTML = `
        <button id="btnYesAccept" class="btn-pink" style="font-size:16px;padding:13px 26px;">
          💖 Đồng Ý Luôn! Yêu ${state.fromName} Nhất!
        </button>
        <button id="btnNoDodge" class="btn-runaway">
          Không đồng ý đâu 😜
        </button>
      `;
      bindRunawayButtons("love");
    } else if (state.mode === "birthday") {
      heading.textContent = `🎂 Chúc Mừng Sinh Nhật ${state.toName} Rực Rỡ Nhất! 🎉`;
      visual.innerHTML = `
        <div class="cake-container">
          <div class="candles-row">
            <div class="candle"><div class="flame"></div></div>
            <div class="candle"><div class="flame"></div></div>
            <div class="candle"><div class="flame"></div></div>
          </div>
          <div class="cake-top"></div>
          <div class="cake-bottom"></div>
        </div>
      `;
      arena.innerHTML = `
        <button id="btnBlowCandles" class="btn-pink" style="font-size:15.5px;padding:13px 26px;">
          💨 Bấm Vào Đây Để Thổi Nến & Ước Nguyện Ngay!
        </button>
      `;
      const btnBlow = document.getElementById("btnBlowCandles");
      btnBlow.addEventListener("click", () => {
        document.querySelectorAll(".flame").forEach((f) => f.classList.add("blown-out"));
        if (window.triggerStageFireworks) window.triggerStageFireworks();
        if (!state.musicPlaying) toggleMusic();
        btnBlow.textContent = `🎉 Điều Ước Tuổi Mới Của ${state.toName} Sẽ Thành Sự Thật 100%! 🎆`;
      });
    } else if (state.mode === "apology") {
      heading.textContent = `🥺 ${state.toName} Ơi, Đừng Giận ${state.fromName} Nữa Nhé! 💖`;
      visual.innerHTML = `<div class="heart-3d-emblem">🧸💝</div>`;
      arena.innerHTML = `
        <button id="btnYesAccept" class="btn-pink" style="font-size:16px;padding:13px 26px;">
          🥰 Tha Lỗi Cho ${state.fromName} Đó, Dẫn Đi Ăn Nhé!
        </button>
        <button id="btnNoDodge" class="btn-runaway">
          Còn lâu mới tha, giận tiếp 😤
        </button>
      `;
      bindRunawayButtons("apology");
    } else if (state.mode === "wheel") {
      heading.textContent = `🧧 Vòng Quay Tình Yêu Dành Tặng ${state.toName}! 🎁`;
      visual.innerHTML = `
        <div class="wheel-wrap">
          <canvas id="luckyWheelCanvas" width="260" height="260" style="border-radius:50%;border:4px solid #fde68a;box-shadow:0 0 25px rgba(255,42,133,0.5);"></canvas>
          <div id="wheelResultText" style="font-size:16px;font-weight:800;color:#fde68a;min-height:26px;">
            👆 Bấm Quay Ngay Để Nhận Quà Từ ${state.fromName}!
          </div>
        </div>
      `;
      arena.innerHTML = `
        <button id="btnSpinWheel" class="btn-pink" style="font-size:15.5px;padding:12px 26px;">
          🎰 Quay Thưởng Nhận Quà Ngay!
        </button>
      `;
      initLuckyWheel();
    }
  }

  function bindRunawayButtons(modeType) {
    const btnYes = document.getElementById("btnYesAccept");
    const btnNo = document.getElementById("btnNoDodge");
    if (!btnYes || !btnNo) return;

    const funnyTexts = [
      "Ơ kìa đừng bấm nút này 🥺",
      "Nút này bị hỏng rồi 😜",
      "Bấm nút màu hồng bên cạnh đi mà 💖",
      "Chạy đâu cho thoát 🥰",
      "Năn nỉ đó, đồng ý đi mà 😭"
    ];

    function dodgeAction(e) {
      if (e && e.type === "touchstart") e.preventDefault();
      state.dodgeCount++;
      state.yesScale = Math.min(1.65, state.yesScale + 0.12);
      btnYes.style.transform = `scale(${state.yesScale})`;

      const offsetX = (Math.random() - 0.5) * 240;
      const offsetY = (Math.random() - 0.5) * 95;
      btnNo.style.transform = `translate(${offsetX}px, ${offsetY}px)`;
      btnNo.textContent = funnyTexts[state.dodgeCount % funnyTexts.length];
    }

    btnNo.addEventListener("mouseenter", dodgeAction);
    btnNo.addEventListener("touchstart", dodgeAction);
    btnNo.addEventListener("click", dodgeAction);

    btnYes.addEventListener("click", () => {
      if (window.triggerStageFireworks) {
        window.triggerStageFireworks();
        setTimeout(window.triggerStageFireworks, 500);
      }
      if (!state.musicPlaying) toggleMusic();
      btnNo.style.display = "none";
      btnYes.style.transform = "scale(1.1)";
      btnYes.textContent =
        modeType === "apology"
          ? `🎉 Yayyy! Cảm ơn ${state.toName} đã tha lỗi! Đi ăn trà sữa ngay thôi! 🧋💖`
          : `💍 Chốt đơn! Từ nay ${state.toName} chính thức là của ${state.fromName} rồi nhé! ❤️`;
    });
  }

  // --------------------------------------------------------------------------
  // 5. MODE 4: VÒNG QUAY TÌNH YÊU & HỘP QUÀ BÍ MẬT
  // --------------------------------------------------------------------------
  function initLuckyWheel() {
    const canvas = document.getElementById("luckyWheelCanvas");
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    const prizes = [
      "🧋 1 Ly Trà Sữa",
      "🧧 Lì Xì 50.000đ",
      "🍲 Đi Ăn Lẩu/Nướng",
      "🤗 Ôm Chặt 60 Giây",
      "🍿 Đi Xem Phim",
      "🎁 1 Món Quà Tự Chọn"
    ];
    const colors = ["#db2777", "#7e22ce", "#e11d48", "#6d28d9", "#be185d", "#9333ea"];
    let currentAngle = 0;

    function drawWheel(angleRot) {
      const R = canvas.width / 2;
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      const arc = (Math.PI * 2) / prizes.length;

      for (let i = 0; i < prizes.length; i++) {
        const start = angleRot + i * arc;
        const end = start + arc;
        ctx.beginPath();
        ctx.moveTo(R, R);
        ctx.arc(R, R, R - 4, start, end);
        ctx.fillStyle = colors[i % colors.length];
        ctx.fill();
        ctx.strokeStyle = "#fde68a";
        ctx.lineWidth = 1.5;
        ctx.stroke();

        ctx.save();
        ctx.translate(R, R);
        ctx.rotate(start + arc / 2);
        ctx.textAlign = "right";
        ctx.fillStyle = "#ffffff";
        ctx.font = "700 12px 'Be Vietnam Pro', sans-serif";
        ctx.fillText(prizes[i], R - 16, 4);
        ctx.restore();
      }

      // Center Hub
      ctx.beginPath();
      ctx.arc(R, R, 22, 0, Math.PI * 2);
      ctx.fillStyle = "#fde68a";
      ctx.fill();
      ctx.fillStyle = "#831843";
      ctx.font = "900 14px sans-serif";
      ctx.textAlign = "center";
      ctx.fillText("💖", R, R + 5);
    }

    drawWheel(0);

    const btnSpin = document.getElementById("btnSpinWheel");
    const resText = document.getElementById("wheelResultText");
    let spinning = false;

    btnSpin.addEventListener("click", () => {
      if (spinning) return;
      spinning = true;
      const extraSpins = Math.PI * 2 * (5 + Math.random() * 4);
      const startAngle = currentAngle;
      const targetAngle = startAngle + extraSpins;
      const startTime = performance.now();
      const duration = 2600;

      function animateWheel(now) {
        const t = Math.min(1, (now - startTime) / duration);
        const easeOut = 1 - Math.pow(1 - t, 3);
        currentAngle = startAngle + (targetAngle - startAngle) * easeOut;
        drawWheel(currentAngle);
        if (t < 1) {
          requestAnimationFrame(animateWheel);
        } else {
          spinning = false;
          const pick = prizes[Math.floor(Math.random() * prizes.length)];
          resText.textContent = `🎉 Chúc mừng ${state.toName} đã quay trúng: ${pick}!`;
          if (window.triggerStageFireworks) window.triggerStageFireworks();
        }
      }
      requestAnimationFrame(animateWheel);
    });
  }

  // --------------------------------------------------------------------------
  // 6. SHAREABLE URL GENERATOR & HIGH-RES GIFT CARD PNG EXPORTER
  // --------------------------------------------------------------------------
  function updateShareableLink() {
    const baseUrl = window.location.origin + window.location.pathname;
    const params = new URLSearchParams();
    params.set("mode", state.mode);
    params.set("to", state.toName);
    params.set("from", state.fromName);
    params.set("msg", state.message);

    const fullUrl = `${baseUrl}?${params.toString()}`;
    const urlBox = document.getElementById("generatedGiftUrlBox");
    if (urlBox) urlBox.value = fullUrl;
    return fullUrl;
  }

  function downloadGiftCardPng() {
    const canvas = document.getElementById("giftCardExportCanvas");
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    const W = canvas.width;
    const H = canvas.height;

    const grad = ctx.createLinearGradient(0, 0, W, H);
    grad.addColorStop(0, "#1c0836");
    grad.addColorStop(0.5, "#4a044e");
    grad.addColorStop(1, "#831843");
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, W, H);

    ctx.strokeStyle = "#fde68a";
    ctx.lineWidth = 4;
    ctx.strokeRect(18, 18, W - 36, H - 36);

    ctx.fillStyle = "#fde68a";
    ctx.font = "800 26px 'Be Vietnam Pro', sans-serif";
    ctx.textAlign = "center";
    ctx.fillText(`💖 MÓN QUÀ 3D DÀNH TẶNG ${state.toName.toUpperCase()} 💖`, W / 2, 78);

    ctx.fillStyle = "#fbcfe8";
    ctx.font = "600 17px 'Be Vietnam Pro', sans-serif";
    ctx.fillText(`Người gửi: ${state.fromName}`, W / 2, 114);

    // Message Wrap
    ctx.fillStyle = "#ffffff";
    ctx.font = "500 18px 'Be Vietnam Pro', sans-serif";
    const words = state.message.split(" ");
    let line = "";
    let y = 185;
    for (let i = 0; i < words.length; i++) {
      const testLine = line + words[i] + " ";
      if (ctx.measureText(testLine).width > 640 && i > 0) {
        ctx.fillText(line, W / 2, y);
        line = words[i] + " ";
        y += 30;
      } else {
        line = testLine;
      }
    }
    ctx.fillText(line, W / 2, y);

    ctx.fillStyle = "#fde68a";
    ctx.font = "700 14.5px 'Be Vietnam Pro', sans-serif";
    ctx.fillText("✨ Mở xem hiệu ứng 3D & nghe nhạc tại: cocvn157.github.io/qua-tang-3d", W / 2, 405);

    const a = document.createElement("a");
    a.href = canvas.toDataURL("image/png");
    a.download = `thiep-qua-tang-3d-${state.toName}.png`;
    a.click();
  }

  // --------------------------------------------------------------------------
  // 7. INITIALIZATION & EVENT LISTENERS
  // --------------------------------------------------------------------------
  document.addEventListener("DOMContentLoaded", () => {
    // Load URL params if someone opened a personalized link
    const params = new URLSearchParams(window.location.search);
    if (params.get("mode")) state.mode = params.get("mode");
    if (params.get("to")) state.toName = params.get("to");
    if (params.get("from")) state.fromName = params.get("from");
    if (params.get("msg")) state.message = params.get("msg");

    // Populate customizer inputs
    document.getElementById("custModeSelect").value = state.mode;
    document.getElementById("custToName").value = state.toName;
    document.getElementById("custFromName").value = state.fromName;
    document.getElementById("custMessageInput").value = state.message;

    initStageCanvas();
    updateVipUI();
    renderStageMode();
    updateShareableLink();

    // Mode tabs switching
    document.querySelectorAll(".mode-tab-btn").forEach((btn) => {
      btn.addEventListener("click", () => {
        state.mode = btn.getAttribute("data-mode");
        document.getElementById("custModeSelect").value = state.mode;
        renderStageMode();
        updateShareableLink();
      });
    });

    // Music toggle
    document.getElementById("btnToggleMusic").addEventListener("click", toggleMusic);

    // Template selector
    document.getElementById("custTemplateSelect").addEventListener("change", (e) => {
      const idx = parseInt(e.target.value, 10) || 0;
      document.getElementById("custMessageInput").value = TEMPLATES[idx] || TEMPLATES[0];
    });

    // Apply customizer
    document.getElementById("btnApplyCustomGift").addEventListener("click", () => {
      state.mode = document.getElementById("custModeSelect").value;
      state.toName = document.getElementById("custToName").value.trim() || "Người Thương";
      state.fromName = document.getElementById("custFromName").value.trim() || "Anh/Em";
      state.message = document.getElementById("custMessageInput").value.trim() || TEMPLATES[0];
      renderStageMode();
      updateShareableLink();
      window.scrollTo({ top: 0, behavior: "smooth" });
    });

    // Copy shareable link
    document.getElementById("btnCopyGiftUrl").addEventListener("click", (e) => {
      const link = updateShareableLink();
      if (navigator.clipboard) navigator.clipboard.writeText(link);
      e.target.textContent = "✅ Đã Copy Link! Gửi Qua Zalo/Messenger Ngay!";
      setTimeout(() => {
        e.target.textContent = "📋 Sao Chép Link Gửi Qua Zalo / Messenger";
      }, 2000);
    });

    // Download Gift Card PNG
    document.getElementById("btnDownloadGiftCardPng").addEventListener("click", downloadGiftCardPng);

    // VIP Modal (19.000đ VietQR)
    document.getElementById("btnOpenVipModal").addEventListener("click", () => {
      const cfg = getOwnerConfig();
      document.getElementById("vipPriceLabel").textContent = Number(cfg.price).toLocaleString("vi-VN") + "đ";
      document.getElementById("vipBankText").textContent = cfg.bankId;
      document.getElementById("vipAccText").textContent = cfg.accountNo;
      document.getElementById("vipNameText").textContent = cfg.accountName;

      const qrUrl = `https://img.vietqr.io/image/${cfg.bankId}-${cfg.accountNo}-compact2.png?amount=${
        cfg.price
      }&addInfo=${encodeURIComponent("MO KHOA VIP QUA TANG 3D")}&accountName=${encodeURIComponent(cfg.accountName)}`;
      document.getElementById("vipVietQrImg").src = qrUrl;
      document.getElementById("vipModal").classList.add("open");
    });

    document.getElementById("btnCloseVipModal").addEventListener("click", () => {
      document.getElementById("vipModal").classList.remove("open");
    });

    document.getElementById("btnVerifyVipCode").addEventListener("click", () => {
      const code = (document.getElementById("vipCodeField").value || "").trim().toUpperCase();
      const msg = document.getElementById("vipVerifyMsg");
      if (code === "VIP2026" || code.startsWith("VIP") || code.startsWith("OMNI")) {
        localStorage.setItem(VIP_KEY, "true");
        updateVipUI();
        if (window.triggerStageFireworks) window.triggerStageFireworks();
        msg.style.color = "#4ade80";
        msg.textContent = "🎉 Mở khóa VIP thành công! Đã xóa quảng cáo & bật pháo hoa VIP!";
        setTimeout(() => {
          document.getElementById("vipModal").classList.remove("open");
        }, 900);
      } else {
        msg.style.color = "#fda4af";
        msg.textContent = "❌ Mã chưa đúng. Hãy nhập VIP2026 để mở khóa ngay!";
      }
    });

    // Owner Bank Setup Modal
    document.getElementById("btnOpenOwnerModal").addEventListener("click", () => {
      const cfg = getOwnerConfig();
      document.getElementById("ownBank").value = cfg.bankId;
      document.getElementById("ownAcc").value = cfg.accountNo;
      document.getElementById("ownName").value = cfg.accountName;
      document.getElementById("ownPrice").value = cfg.price;
      document.getElementById("ownerModal").classList.add("open");
    });

    document.getElementById("btnCloseOwnerModal").addEventListener("click", () => {
      document.getElementById("ownerModal").classList.remove("open");
    });

    document.getElementById("btnSaveOwnerSettings").addEventListener("click", () => {
      const newCfg = {
        bankId: document.getElementById("ownBank").value.trim().toUpperCase() || "MB",
        accountNo: document.getElementById("ownAcc").value.trim() || "0988888888",
        accountName: document.getElementById("ownName").value.trim().toUpperCase() || "NGUYEN VAN A",
        price: parseInt(document.getElementById("ownPrice").value, 10) || 19000
      };
      localStorage.setItem(OWNER_KEY, JSON.stringify(newCfg));
      document.getElementById("ownerModal").classList.remove("open");
      alert("✅ Đã lưu số tài khoản nhận tiền VietQR của bạn thành công!");
    });
  });
})();
