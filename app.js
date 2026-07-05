const { useState, useEffect, useRef, useCallback } = React;

const WEEKDAYS = ["Пн", "Вт", "Ср", "Чт", "Пт", "Сб", "Вс"];
const MONTHS = [
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
];
const MONTHS_GEN = [
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
];
const WEEKDAYS_FULL = [
  "воскресенье",
  "понедельник",
  "вторник",
  "среда",
  "четверг",
  "пятница",
  "суббота",
];

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

function translateAuthError(code) {
  const map = {
    "auth/invalid-email": "Некорректный email.",
    "auth/user-not-found": "Такой пользователь не найден.",
    "auth/wrong-password": "Неверный пароль.",
    "auth/invalid-credential": "Неверный email или пароль.",
    "auth/email-already-in-use":
      "Этот email уже зарегистрирован. Попробуйте войти.",
    "auth/weak-password": "Пароль слишком короткий (минимум 6 символов).",
    "auth/missing-password": "Введите пароль.",
  };
  return map[code] || "Что-то пошло не так. Попробуйте ещё раз.";
}

function LoginScreen() {
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
      setError(translateAuthError(err.code));
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="diary-root login-screen">
      <div className="login-eyebrow">личный дневник</div>
      <div className="login-title">
        {mode === "login" ? "С возвращением" : "Создать дневник"}
      </div>
      <div className="login-sub">
        {mode === "login"
          ? "Войдите, чтобы увидеть свои записи."
          : "Придумайте пароль — доступ к записям будет только у вас."}
      </div>

      <form onSubmit={submit}>
        <div className="login-field">
          <label>Email</label>
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
          <label>Пароль</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="минимум 6 символов"
            required
            autoComplete={
              mode === "login" ? "current-password" : "new-password"
            }
          />
        </div>
        {error && <div className="login-error">{error}</div>}
        <button className="login-btn" type="submit" disabled={busy}>
          {busy
            ? "Подождите…"
            : mode === "login"
              ? "Войти"
              : "Зарегистрироваться"}
        </button>
      </form>

      <div className="login-switch">
        {mode === "login" ? (
          <>
            Нет дневника?{" "}
            <button
              onClick={() => {
                setMode("signup");
                setError("");
              }}
            >
              Создать
            </button>
          </>
        ) : (
          <>
            Уже есть дневник?{" "}
            <button
              onClick={() => {
                setMode("login");
                setError("");
              }}
            >
              Войти
            </button>
          </>
        )}
      </div>
    </div>
  );
}

function CalendarApp({ user }) {
  const [notes, setNotes] = useState({});
  const [loaded, setLoaded] = useState(false);
  const [viewDate, setViewDate] = useState(new Date());
  const [selectedKey, setSelectedKey] = useState(null);
  const [draft, setDraft] = useState("");
  const [sheetOpen, setSheetOpen] = useState(false);
  const [sheetMounted, setSheetMounted] = useState(false);
  const [status, setStatus] = useState("");
  const statusTimer = useRef(null);
  const today = new Date();

  const notesRef = firebase
    .firestore()
    .collection("users")
    .doc(user.uid)
    .collection("notes");

  useEffect(() => {
    (async () => {
      try {
        const snap = await notesRef.get();
        const map = {};
        snap.forEach((doc) => {
          map[doc.id] = doc.data().text || "";
        });
        setNotes(map);
      } catch (e) {
        console.error("Не удалось загрузить записи", e);
      }
      setLoaded(true);
    })();
  }, [user.uid]);

  const openDay = (y, m, d) => {
    const k = keyOf(y, m, d);
    setSelectedKey(k);
    setDraft(notes[k] || "");
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
    }, 260);
  };

  const save = async () => {
    if (!selectedKey) return;
    clearTimeout(statusTimer.current);
    setStatus("saving");
    const next = { ...notes };
    try {
      if (draft.trim() === "") {
        delete next[selectedKey];
        await notesRef
          .doc(selectedKey)
          .delete()
          .catch(() => {});
      } else {
        next[selectedKey] = draft;
        await notesRef.doc(selectedKey).set({
          text: draft,
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
    selectedKey && notes[selectedKey] && notes[selectedKey].trim() !== "";

  return (
    <div className="diary-root">
      <div className="diary-scroll">
        {!loaded ? (
          <div className="loading-wrap">Загрузка дневника…</div>
        ) : (
          <>
            <div className="diary-header">
              <div>
                <div className="diary-eyebrow">личный дневник</div>
                <div className="diary-title">Мой календарь</div>
              </div>
              <button
                className="logout-btn"
                onClick={() => firebase.auth().signOut()}
              >
                Выйти
              </button>
            </div>

            <div className="month-bar">
              <button
                className="month-nav-btn"
                onClick={() => changeMonth(-1)}
                aria-label="Предыдущий месяц"
              >
                ‹
              </button>
              <div className="month-label">
                {MONTHS[month]} {year}
              </div>
              <button
                className="month-nav-btn"
                onClick={() => changeMonth(1)}
                aria-label="Следующий месяц"
              >
                ›
              </button>
            </div>

            <div className="calendar-card">
              <div className="weekday-row">
                {WEEKDAYS.map((w) => (
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
                  const hasNote = !!(notes[k] && notes[k].trim() !== "");
                  const isToday = sameDay(new Date(year, month, d), today);
                  return (
                    <div className="day-cell" key={k}>
                      <button
                        className={`day-btn ${isToday ? "today" : ""}`}
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

            <div className="hint">
              Нажмите на дату, чтобы добавить или посмотреть запись
            </div>
            <div className="sync-hint">Вы вошли как {user.email}</div>
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
                    ? WEEKDAYS_FULL[selectedDateObj.getDay()]
                    : ""}
                </div>
                <div className="sheet-date">
                  {selectedDateObj
                    ? `${selectedDateObj.getDate()} ${MONTHS_GEN[selectedDateObj.getMonth()]}`
                    : ""}
                </div>
              </div>
              <button
                className="icon-btn"
                onClick={closeSheet}
                aria-label="Закрыть"
              >
                ✕
              </button>
            </div>

            <div className="sheet-body">
              <textarea
                className="sheet-textarea"
                placeholder="Что произошло в этот день?"
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
              />
            </div>

            <div className="sheet-footer">
              <div className="status-text">
                {status === "saving" && "Сохраняем…"}
                {status === "saved" && "✓ Сохранено"}
                {!status && hasExistingNote && (
                  <button className="delete-link" onClick={removeNote}>
                    🗑 Удалить запись
                  </button>
                )}
              </div>
              <button
                className={`save-btn ${status === "saved" ? "saved" : ""}`}
                onClick={save}
              >
                ✓ Сохранить
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

  useEffect(() => {
    const unsub = firebase.auth().onAuthStateChanged((u) => setUser(u));
    return unsub;
  }, []);

  useEffect(() => {
    if (!window.visualViewport) return;

    const updateHeight = () => {
      document.documentElement.style.setProperty(
        "--app-height",
        `${window.visualViewport.height}px`,
      );
    };

    window.visualViewport.addEventListener("resize", updateHeight);
    updateHeight();

    return () =>
      window.visualViewport.removeEventListener("resize", updateHeight);
  }, []);

  if (user === undefined) {
    return (
      <div className="diary-root">
        <div className="loading-wrap">Загрузка…</div>
      </div>
    );
  }
  return user ? <CalendarApp user={user} /> : <LoginScreen />;
}

ReactDOM.createRoot(document.getElementById("root")).render(<Root />);
