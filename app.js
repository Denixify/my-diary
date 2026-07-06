const { useState, useEffect, useRef, useCallback } = React;

function pad(n) {
  return String(n).padStart(2, "0");
}
function keyOf(y, m, d) {
  return `${y}-${pad(m + 1)}-${pad(d)}`;
}
function sameDay(a, b) {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

const LANG_STORAGE_KEY = "diary-lang";

const STRINGS = {
  ru: {
    weekdays: ["Пн", "Вт", "Ср", "Чт", "Пт", "Сб", "Вс"],
    weekdaysFull: [
      "воскресенье",
      "понедельник",
      "вторник",
      "среда",
      "четверг",
      "пятница",
      "суббота",
    ],
    months: [
      "Январь",
      "Февраль",
      "Март",
      "Апрель",
      "Май",
      "Июнь",
      "Июль",
      "Август",
      "Сентябрь",
      "Октябрь",
      "Ноябрь",
      "Декабрь",
    ],
    monthsGen: [
      "января",
      "февраля",
      "марта",
      "апреля",
      "мая",
      "июня",
      "июля",
      "августа",
      "сентября",
      "октября",
      "ноября",
      "декабря",
    ],
    eyebrow: "личный дневник",
    title: "Мой календарь",
    logout: "Выйти",
    hint: "Нажмите на дату, чтобы добавить или посмотреть запись",
    loggedInAs: (email) => `Вы вошли как ${email}`,
    loading: "Загрузка дневника…",
    loadingApp: "Загрузка…",
    markDay: "Отметить день",
    colorNames: { red: "Красный", yellow: "Жёлтый", green: "Зелёный" },
    placeholder: "Что произошло в этот день?",
    save: "Сохранить",
    saving: "Сохраняем…",
    saved: "Сохранено",
    delete: "Удалить запись",
    close: "Закрыть",
    prevMonth: "Предыдущий месяц",
    nextMonth: "Следующий месяц",
    welcomeBack: "С возвращением",
    createDiary: "Создать дневник",
    subLogin: "Войдите, чтобы увидеть свои записи.",
    subSignup: "Придумайте пароль — доступ к записям будет только у вас.",
    emailLabel: "Email",
    passwordLabel: "Пароль",
    passwordPlaceholder: "минимум 6 символов",
    loginBtn: "Войти",
    signupBtn: "Зарегистрироваться",
    pleaseWait: "Подождите…",
    noAccount: "Нет дневника?",
    createLink: "Создать",
    haveAccount: "Уже есть дневник?",
    loginLink: "Войти",
    errors: {
      "auth/invalid-email": "Некорректный email.",
      "auth/user-not-found": "Такой пользователь не найден.",
      "auth/wrong-password": "Неверный пароль.",
      "auth/invalid-credential": "Неверный email или пароль.",
      "auth/email-already-in-use":
        "Этот email уже зарегистрирован. Попробуйте войти.",
      "auth/weak-password": "Пароль слишком короткий (минимум 6 символов).",
      "auth/missing-password": "Введите пароль.",
    },
    fallbackError: "Что-то пошло не так. Попробуйте ещё раз.",
  },
  uk: {
    weekdays: ["Пн", "Вт", "Ср", "Чт", "Пт", "Сб", "Нд"],
    weekdaysFull: [
      "неділя",
      "понеділок",
      "вівторок",
      "середа",
      "четвер",
      "п'ятниця",
      "субота",
    ],
    months: [
      "Січень",
      "Лютий",
      "Березень",
      "Квітень",
      "Травень",
      "Червень",
      "Липень",
      "Серпень",
      "Вересень",
      "Жовтень",
      "Листопад",
      "Грудень",
    ],
    monthsGen: [
      "січня",
      "лютого",
      "березня",
      "квітня",
      "травня",
      "червня",
      "липня",
      "серпня",
      "вересня",
      "жовтня",
      "листопада",
      "грудня",
    ],
    eyebrow: "особистий щоденник",
    title: "Мій календар",
    logout: "Вийти",
    hint: "Натисніть на дату, щоб додати або переглянути запис",
    loggedInAs: (email) => `Ви увійшли як ${email}`,
    loading: "Завантаження щоденника…",
    loadingApp: "Завантаження…",
    markDay: "Позначити день",
    colorNames: { red: "Червоний", yellow: "Жовтий", green: "Зелений" },
    placeholder: "Що сталося цього дня?",
    save: "Зберегти",
    saving: "Зберігаємо…",
    saved: "Збережено",
    delete: "Видалити запис",
    close: "Закрити",
    prevMonth: "Попередній місяць",
    nextMonth: "Наступний місяць",
    welcomeBack: "З поверненням",
    createDiary: "Створити щоденник",
    subLogin: "Увійдіть, щоб побачити свої записи.",
    subSignup: "Придумайте пароль — доступ до записів буде лише у вас.",
    emailLabel: "Email",
    passwordLabel: "Пароль",
    passwordPlaceholder: "мінімум 6 символів",
    loginBtn: "Увійти",
    signupBtn: "Зареєструватися",
    pleaseWait: "Зачекайте…",
    noAccount: "Немає щоденника?",
    createLink: "Створити",
    haveAccount: "Вже є щоденник?",
    loginLink: "Увійти",
    errors: {
      "auth/invalid-email": "Некоректний email.",
      "auth/user-not-found": "Такого користувача не знайдено.",
      "auth/wrong-password": "Невірний пароль.",
      "auth/invalid-credential": "Невірний email або пароль.",
      "auth/email-already-in-use":
        "Цей email вже зареєстровано. Спробуйте увійти.",
      "auth/weak-password": "Пароль надто короткий (мінімум 6 символів).",
      "auth/missing-password": "Введіть пароль.",
    },
    fallbackError: "Щось пішло не так. Спробуйте ще раз.",
  },
};

function translateAuthError(code, lang) {
  const t = STRINGS[lang] || STRINGS.ru;
  return t.errors[code] || t.fallbackError;
}

const APP_SALT = "moy-dnevnik-salt-v1";

function bufToBase64(buf) {
  let binary = "";
  const bytes = new Uint8Array(buf);
  for (let i = 0; i < bytes.byteLength; i++)
    binary += String.fromCharCode(bytes[i]);
  return btoa(binary);
}
function base64ToBuf(b64) {
  const binary = atob(b64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
  return bytes;
}

async function deriveNotesKey(uid) {
  const enc = new TextEncoder();
  const keyMaterial = await crypto.subtle.importKey(
    "raw",
    enc.encode(uid + APP_SALT),
    "PBKDF2",
    false,
    ["deriveKey"],
  );
  return crypto.subtle.deriveKey(
    {
      name: "PBKDF2",
      salt: enc.encode(APP_SALT),
      iterations: 100000,
      hash: "SHA-256",
    },
    keyMaterial,
    { name: "AES-GCM", length: 256 },
    false,
    ["encrypt", "decrypt"],
  );
}

async function encryptNoteText(key, text) {
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const enc = new TextEncoder();
  const cipherBuf = await crypto.subtle.encrypt(
    { name: "AES-GCM", iv },
    key,
    enc.encode(text),
  );
  return `enc:${bufToBase64(iv)}:${bufToBase64(cipherBuf)}`;
}

async function decryptNoteText(key, stored) {
  if (!stored) return "";
  if (!stored.startsWith("enc:")) return stored;
  try {
    const parts = stored.split(":");
    const iv = base64ToBuf(parts[1]);
    const data = base64ToBuf(parts[2]);
    const plainBuf = await crypto.subtle.decrypt(
      { name: "AES-GCM", iv },
      key,
      data,
    );
    return new TextDecoder().decode(plainBuf);
  } catch (e) {
    console.error("Не удалось расшифровать запись", e);
    return "⚠️";
  }
}

function LoginScreen({ lang }) {
  const t = STRINGS[lang] || STRINGS.ru;
  const [mode, setMode] = useState("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setError("");
    setBusy(true);
    try {
      if (mode === "login") {
        await firebase.auth().signInWithEmailAndPassword(email, password);
      } else {
        await firebase.auth().createUserWithEmailAndPassword(email, password);
      }
    } catch (err) {
      setError(translateAuthError(err.code, lang));
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="diary-root login-screen">
      <div className="login-eyebrow">{t.eyebrow}</div>
      <div className="login-title">
        {mode === "login" ? t.welcomeBack : t.createDiary}
      </div>
      <div className="login-sub">
        {mode === "login" ? t.subLogin : t.subSignup}
      </div>

      <form onSubmit={submit}>
        <div className="login-field">
          <label>{t.emailLabel}</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
            required
            autoComplete="email"
          />
        </div>
        <div className="login-field">
          <label>{t.passwordLabel}</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder={t.passwordPlaceholder}
            required
            autoComplete={
              mode === "login" ? "current-password" : "new-password"
            }
          />
        </div>
        {error && <div className="login-error">{error}</div>}
        <button className="login-btn" type="submit" disabled={busy}>
          {busy ? t.pleaseWait : mode === "login" ? t.loginBtn : t.signupBtn}
        </button>
      </form>

      <div className="login-switch">
        {mode === "login" ? (
          <>
            {t.noAccount}{" "}
            <button
              onClick={() => {
                setMode("signup");
                setError("");
              }}
            >
              {t.createLink}
            </button>
          </>
        ) : (
          <>
            {t.haveAccount}{" "}
            <button
              onClick={() => {
                setMode("login");
                setError("");
              }}
            >
              {t.loginLink}
            </button>
          </>
        )}
      </div>
    </div>
  );
}

function CalendarApp({ user, lang, setLang }) {
  const t = STRINGS[lang] || STRINGS.ru;
  const [notes, setNotes] = useState({});
  const [loaded, setLoaded] = useState(false);
  const [viewDate, setViewDate] = useState(new Date());
  const [selectedKey, setSelectedKey] = useState(null);
  const [draft, setDraft] = useState("");
  const [draftColor, setDraftColor] = useState(null);
  const [sheetOpen, setSheetOpen] = useState(false);
  const [sheetMounted, setSheetMounted] = useState(false);
  const [status, setStatus] = useState("");
  const statusTimer = useRef(null);
  const today = new Date();
  const [cryptoKey, setCryptoKey] = useState(null);

  useEffect(() => {
    let active = true;
    deriveNotesKey(user.uid).then((key) => {
      if (active) setCryptoKey(key);
    });
    return () => {
      active = false;
    };
  }, [user.uid]);

  const notesRef = firebase
    .firestore()
    .collection("users")
    .doc(user.uid)
    .collection("notes");

  useEffect(() => {
    if (!cryptoKey) return;
    (async () => {
      try {
        const snap = await notesRef.get();
        const map = {};
        await Promise.all(
          snap.docs.map(async (doc) => {
            const d = doc.data();
            const plainText = await decryptNoteText(cryptoKey, d.text || "");
            map[doc.id] = { text: plainText, color: d.color || null };
          }),
        );
        setNotes(map);
      } catch (e) {
        console.error("Не удалось загрузить записи", e);
      }
      setLoaded(true);
    })();
  }, [user.uid, cryptoKey]);

  const openDay = (y, m, d) => {
    const k = keyOf(y, m, d);
    setSelectedKey(k);
    setDraft(notes[k]?.text || "");
    setDraftColor(notes[k]?.color || null);
    setSheetMounted(true);
    requestAnimationFrame(() =>
      requestAnimationFrame(() => setSheetOpen(true)),
    );
  };

  const closeSheet = () => {
    setSheetOpen(false);
    setStatus("");
    setTimeout(() => {
      setSheetMounted(false);
      setSelectedKey(null);
      setDraft("");
      setDraftColor(null);
    }, 260);
  };

  const save = async () => {
    if (!selectedKey || !cryptoKey) return;
    clearTimeout(statusTimer.current);
    setStatus("saving");
    const next = { ...notes };
    const textEmpty = draft.trim() === "";
    try {
      if (textEmpty && !draftColor) {
        delete next[selectedKey];
        await notesRef
          .doc(selectedKey)
          .delete()
          .catch(() => {});
      } else {
        next[selectedKey] = { text: draft, color: draftColor };
        const encryptedText = await encryptNoteText(cryptoKey, draft);
        await notesRef.doc(selectedKey).set({
          text: encryptedText,
          color: draftColor,
          updatedAt: firebase.firestore.FieldValue.serverTimestamp(),
        });
      }
      setNotes(next);
      setStatus("saved");
      statusTimer.current = setTimeout(() => setStatus(""), 1400);
    } catch (e) {
      console.error("Не удалось сохранить", e);
      setStatus("");
    }
  };

  const removeNote = async () => {
    if (!selectedKey) return;
    const next = { ...notes };
    delete next[selectedKey];
    setNotes(next);
    setDraft("");
    setDraftColor(null);
    try {
      await notesRef.doc(selectedKey).delete();
    } catch (e) {
      console.error("Не удалось удалить", e);
    }
    closeSheet();
  };

  const changeMonth = (delta) => {
    setViewDate((d) => new Date(d.getFullYear(), d.getMonth() + delta, 1));
  };

  const year = viewDate.getFullYear();
  const month = viewDate.getMonth();
  const firstOfMonth = new Date(year, month, 1);
  const startOffset = (firstOfMonth.getDay() + 6) % 7;
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const cells = [];
  for (let i = 0; i < startOffset; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);

  const selectedDateObj = selectedKey
    ? new Date(
        Number(selectedKey.slice(0, 4)),
        Number(selectedKey.slice(5, 7)) - 1,
        Number(selectedKey.slice(8, 10)),
      )
    : null;

  const hasExistingNote =
    selectedKey &&
    ((notes[selectedKey]?.text || "").trim() !== "" ||
      !!notes[selectedKey]?.color);

  const COLORS = ["red", "yellow", "green"];

  return (
    <div className="diary-root">
      <div className="diary-scroll">
        {!loaded ? (
          <div className="loading-wrap">{t.loading}</div>
        ) : (
          <>
            <div className="diary-header">
              <div>
                <div className="diary-eyebrow">{t.eyebrow}</div>
                <div className="diary-title">{t.title}</div>
              </div>
              <div className="header-actions">
                <div className="lang-switch">
                  <button
                    className={`lang-btn ${lang === "ru" ? "active" : ""}`}
                    onClick={() => setLang("ru")}
                  >
                    RU
                  </button>
                  <button
                    className={`lang-btn ${lang === "uk" ? "active" : ""}`}
                    onClick={() => setLang("uk")}
                  >
                    UA
                  </button>
                </div>
                <button
                  className="logout-btn"
                  onClick={() => firebase.auth().signOut()}
                >
                  {t.logout}
                </button>
              </div>
            </div>

            <div className="month-bar">
              <button
                className="month-nav-btn"
                onClick={() => changeMonth(-1)}
                aria-label={t.prevMonth}
              >
                ‹
              </button>
              <div className="month-label">
                {t.months[month]} {year}
              </div>
              <button
                className="month-nav-btn"
                onClick={() => changeMonth(1)}
                aria-label={t.nextMonth}
              >
                ›
              </button>
            </div>

            <div className="calendar-card">
              <div className="weekday-row">
                {t.weekdays.map((w) => (
                  <div className="weekday-cell" key={w}>
                    {w}
                  </div>
                ))}
              </div>
              <div className="day-grid">
                {cells.map((d, i) => {
                  if (d === null)
                    return (
                      <div className="day-cell" key={`e${i}`}>
                        <div className="day-btn empty" />
                      </div>
                    );
                  const k = keyOf(year, month, d);
                  const noteEntry = notes[k];
                  const hasNote = !!(
                    noteEntry &&
                    noteEntry.text &&
                    noteEntry.text.trim() !== ""
                  );
                  const tagColor = noteEntry?.color || null;
                  const isToday = sameDay(new Date(year, month, d), today);
                  return (
                    <div className="day-cell" key={k}>
                      <button
                        className={`day-btn ${isToday ? "today" : ""} ${tagColor ? `tag-${tagColor}` : ""}`}
                        onClick={() => openDay(year, month, d)}
                      >
                        <span>{d}</span>
                        {hasNote ? (
                          <span className="day-dot" />
                        ) : (
                          <span className="day-dot-spacer" />
                        )}
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="hint">{t.hint}</div>
            <div className="sync-hint">{t.loggedInAs(user.email)}</div>
          </>
        )}
      </div>

      {sheetMounted && (
        <>
          <div
            className={`backdrop ${sheetOpen ? "open" : ""}`}
            onClick={closeSheet}
          />
          <div className={`sheet ${sheetOpen ? "open" : ""}`}>
            <div className="sheet-handle" />
            <div className="sheet-header">
              <div>
                <div className="sheet-date-eyebrow">
                  {selectedDateObj
                    ? t.weekdaysFull[selectedDateObj.getDay()]
                    : ""}
                </div>
                <div className="sheet-date">
                  {selectedDateObj
                    ? `${selectedDateObj.getDate()} ${t.monthsGen[selectedDateObj.getMonth()]}`
                    : ""}
                </div>
              </div>
              <button
                className="icon-btn"
                onClick={closeSheet}
                aria-label={t.close}
              >
                ✕
              </button>
            </div>

            <div className="color-picker">
              <span className="color-picker-label">{t.markDay}</span>
              {COLORS.map((c) => (
                <button
                  key={c}
                  type="button"
                  className={`color-swatch color-swatch-${c} ${draftColor === c ? "selected" : ""}`}
                  onClick={() => setDraftColor(draftColor === c ? null : c)}
                  aria-label={t.colorNames[c]}
                  aria-pressed={draftColor === c}
                >
                  {draftColor === c && <span className="color-check">✓</span>}
                </button>
              ))}
            </div>

            <div className="sheet-body">
              <textarea
                className="sheet-textarea"
                placeholder={t.placeholder}
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
              />
            </div>

            <div className="sheet-footer">
              <div className="status-text">
                {status === "saving" && t.saving}
                {status === "saved" && `✓ ${t.saved}`}
                {!status && hasExistingNote && (
                  <button className="delete-link" onClick={removeNote}>
                    🗑 {t.delete}
                  </button>
                )}
              </div>
              <button
                className={`save-btn ${status === "saved" ? "saved" : ""}`}
                onClick={save}
              >
                ✓ {t.save}
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

function Root() {
  const [user, setUser] = useState(undefined);
  const [lang, setLang] = useState(() => {
    try {
      const saved = localStorage.getItem(LANG_STORAGE_KEY);
      return saved === "ru" || saved === "uk" ? saved : "ru";
    } catch (e) {
      return "ru";
    }
  });
  const t = STRINGS[lang] || STRINGS.ru;

  useEffect(() => {
    try {
      localStorage.setItem(LANG_STORAGE_KEY, lang);
    } catch (e) {}
  }, [lang]);

  useEffect(() => {
    const unsub = firebase.auth().onAuthStateChanged((u) => setUser(u));
    return unsub;
  }, []);

  useEffect(() => {
    if (!window.visualViewport) return;

    const updateLayout = () => {
      document.documentElement.style.setProperty(
        "--app-height",
        `${window.visualViewport.height}px`,
      );
      document.documentElement.style.setProperty(
        "--app-offset",
        `${window.visualViewport.offsetTop}px`,
      );
      window.scrollTo(0, 0);
    };

    window.visualViewport.addEventListener("resize", updateLayout);
    window.visualViewport.addEventListener("scroll", updateLayout);
    updateLayout();

    return () => {
      window.visualViewport.removeEventListener("resize", updateLayout);
      window.visualViewport.removeEventListener("scroll", updateLayout);
    };
  }, []);

  if (user === undefined) {
    return (
      <div className="diary-root">
        <div className="loading-wrap">{t.loadingApp}</div>
      </div>
    );
  }
  return user ? (
    <CalendarApp user={user} lang={lang} setLang={setLang} />
  ) : (
    <LoginScreen lang={lang} />
  );
}

ReactDOM.createRoot(document.getElementById("root")).render(<Root />);
