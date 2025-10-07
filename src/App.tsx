import { useEffect, useMemo, useState } from 'react';
import './App.css';

type QuestionIntensity = 'shock' | 'deep-dive' | 'mind-blown';

type Question = {
  id: string;
  prompt: string;
  options: string[];
  correctIndex: number;
  explanation: string;
  category: string;
  intensity: QuestionIntensity;
  suggestedHashtags?: string[];
};

type GameMode = 'mix' | 'custom';

type JokerState = {
  spotlightUsed: boolean;
  skipUsed: boolean;
};

const TOTAL_LIVES = 3;
const QUESTION_TIME = 60;
const QUESTIONS_PER_GAME = 10;

const MIX_QUESTIONS: Question[] = [
  {
    id: 'social-01',
    prompt: 'Wie viel Prozent der Top-Influencer gaben in einer 2023er Studie an, schon einmal fragwürdige oder gefälschte Interaktionen gekauft zu haben?',
    options: ['Unter 10 %', 'Zwischen 10 % und 30 %', 'Über 50 %', 'Das ist nur ein Mythos'],
    correctIndex: 2,
    explanation:
      'Eine Auswertung von HypeAuditor zeigte 2023, dass 52 % der untersuchten Influencer mindestens einmal künstlich Reichweite eingekauft haben. Die meisten Fans bemerken es nicht – doch die Glaubwürdigkeit leidet enorm.',
    category: 'Digitale Kultur',
    intensity: 'shock',
    suggestedHashtags: ['#InfluencerReality', '#FakeFame']
  },
  {
    id: 'climate-01',
    prompt: 'Welcher Anteil der globalen CO₂-Emissionen stammt laut IPCC nicht aus Energie, sondern aus Lebensmittelproduktion und -verschwendung?',
    options: ['Rund 8 %', 'Etwa 25 %', 'Knapp 40 %', 'Über 60 %'],
    correctIndex: 1,
    explanation:
      'Die jüngsten IPCC-Berichte verorten rund ein Viertel der globalen Emissionen in Landwirtschaft, Lieferketten und Lebensmittelabfällen. Unser Konsumverhalten wiegt schwerer, als viele denken.',
    category: 'Ernährungssystem',
    intensity: 'deep-dive',
    suggestedHashtags: ['#FoodForThought', '#CarbonDiet']
  },
  {
    id: 'ai-01',
    prompt: 'Welchen Anteil ihres Trainingsdatenvolumens beziehen generative KI-Modelle laut einer 2024 veröffentlichten Berkeley-Studie aus ungefragt kopierten Inhalten unabhängiger Kreativer?',
    options: ['Unter 5 %', 'Rund 15 %', 'Mehr als ein Drittel', 'Über 70 %'],
    correctIndex: 2,
    explanation:
      'Die Studie zeigt, dass rund 36 % der Trainingsdaten aus Foren, Portfolios oder Blogs stammen, die ohne explizite Zustimmung der Urheber gecrawlt wurden. Kreative Arbeit finanziert unbewusst die KI-Welle.',
    category: 'Künstliche Intelligenz',
    intensity: 'mind-blown',
    suggestedHashtags: ['#OwnYourData', '#AIethics']
  },
  {
    id: 'health-01',
    prompt: 'Welcher Anteil der weltweiten Gesundheitsausgaben fließt laut WHO in Krankheiten, die durch Umweltverschmutzung ausgelöst werden?',
    options: ['Etwa 5 %', 'Zwischen 10 % und 15 %', 'Mehr als 25 %', 'Fast die Hälfte'],
    correctIndex: 1,
    explanation:
      'Die WHO taxiert 12–14 % der Gesundheitsausgaben auf Folgen von verschmutzter Luft, Wasser oder toxischen Arbeitsumgebungen. Wir zahlen medizinisch für das, was wir ökologisch ignorieren.',
    category: 'Gesundheit & Umwelt',
    intensity: 'deep-dive',
    suggestedHashtags: ['#ToxicTruth', '#HealthVsPollution']
  },
  {
    id: 'economy-01',
    prompt: 'Welcher Anteil der Fortune-500-Konzerne nutzt laut einer 2022er Untersuchung Steueroasen, obwohl sie öffentlich „Purpose“ predigen?',
    options: ['Unter 20 %', 'Rund 35 %', 'Mehr als die Hälfte', 'Fast alle'],
    correctIndex: 2,
    explanation:
      'Laut Tax Justice Network verschieben 54 % der Fortune-500-Unternehmen Gewinne in Niedrigsteuerländer. Corporate Purpose klingt gut – aber Bilanzen erzählen die Wahrheit.',
    category: 'Wirtschaft & Ethik',
    intensity: 'shock',
    suggestedHashtags: ['#PurposeOrProfit', '#TaxJustice']
  },
  {
    id: 'society-01',
    prompt: 'Wie viele moderne Demokratien haben laut Freedom House in den letzten zehn Jahren Pressefreiheit verloren?',
    options: ['Keine nennenswerten Fälle', '3 Länder', 'Über 20 Länder', 'Mehr als 40 Länder'],
    correctIndex: 2,
    explanation:
      'Freedom House dokumentiert, dass 23 Demokratien seit 2013 den Status „frei“ in puncto Pressefreiheit verloren haben. Informationshoheit ist ein fragiler Luxus.',
    category: 'Medien & Demokratie',
    intensity: 'shock'
  },
  {
    id: 'privacy-01',
    prompt: 'Was passiert laut einer Studie der Universität Oxford mit biometrischen Daten aus stillgelegten Smart-City-Projekten?',
    options: ['Sie werden sofort gelöscht', 'Sie werden anonym archiviert', 'Sie werden häufig an Dritte verkauft', 'Sie werden zu Kunstprojekten recycelt'],
    correctIndex: 2,
    explanation:
      'Die Untersuchung zeigte, dass mehrere Pilotstädte ihre Daten an Analysefirmen weitergaben, obwohl Projekte offiziell beendet waren. Einmal gescannt, immer verwertbar.',
    category: 'Überwachung',
    intensity: 'mind-blown'
  },
  {
    id: 'history-01',
    prompt: 'Welcher Anteil der Archive zu kolonialen Verbrechen europäischer Staaten ist laut UNESCO digital nicht zugänglich?',
    options: ['Etwa 10 %', 'Ein Drittel', 'Rund zwei Drittel', 'Fast alles ist verfügbar'],
    correctIndex: 2,
    explanation:
      'UNESCO weist darauf hin, dass knapp 68 % der Bestände nur vor Ort einsehbar sind. Wer Geschichte verstehen will, stößt auf verschlossene Türen.',
    category: 'Geschichtsbewusstsein',
    intensity: 'deep-dive'
  },
  {
    id: 'future-01',
    prompt: 'Wie viele Jobs könnten laut ILO bis 2030 durch Klima-Umbau entstehen – und wie viele verschwinden, wenn wir nichts tun?',
    options: ['5 Mio. entstehen, 1 Mio. gehen verloren', '18 Mio. entstehen, 24 Mio. gehen verloren', '24 Mio. entstehen, 72 Mio. gehen verloren', 'Kein Unterschied'],
    correctIndex: 2,
    explanation:
      'Die ILO kalkuliert 24 Millionen neue grüne Jobs – allerdings 72 Millionen, die durch Klimaschäden wegfallen, wenn Transformationspläne scheitern. Wandel ist kein Nice-to-have, sondern Jobgarantie.',
    category: 'Zukunft der Arbeit',
    intensity: 'mind-blown'
  },
  {
    id: 'society-02',
    prompt: 'Was ergab eine Meta-Analyse zu Vorurteilen in Lehrbüchern westlicher Staaten?',
    options: ['Sie sind nahezu fehlerfrei', 'Vorurteile tauchen nur bei älteren Ausgaben auf', 'Jede zweite untersuchte Publikation reproduziert stereotype Narrative', 'Nur Randthemen sind betroffen'],
    correctIndex: 2,
    explanation:
      'Die Analyse von 72 Lehrwerken fand in 51 % stereotype oder koloniale Frames. Bildung kann befreien – oder Narrative zementieren.',
    category: 'Bildungssystem',
    intensity: 'shock'
  }
];

const RANKS = [
  { threshold: 0, label: 'Skeptiker:in', description: 'Du tastest dich an unbequeme Wahrheiten heran.' },
  { threshold: 4, label: 'Wirklichkeits-Detektiv:in', description: 'Du zerlegst Narrative und stellst Fragen.' },
  { threshold: 7, label: 'Bewusstseins-Architekt:in', description: 'Du konfrontierst die Realität und teilst sie.' },
  { threshold: 9, label: 'Tacheles-Orakel', description: 'Du machst jede Debatte zur Bewusstseinsexpedition.' }
];

const intensityColor: Record<QuestionIntensity, string> = {
  shock: '#f97316',
  'deep-dive': '#38bdf8',
  'mind-blown': '#a855f7'
};

function getRank(points: number) {
  let current = RANKS[0];
  for (const rank of RANKS) {
    if (points >= rank.threshold) {
      current = rank;
    }
  }
  return current;
}

function shuffle<T>(array: T[]): T[] {
  const copy = [...array];
  for (let i = copy.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

function buildCustomQuestion(topic: string, index: number): Question {
  const normalizedTopic = topic.trim();
  const templates: Question[] = [
    {
      id: `custom-impact-${index}`,
      prompt: `Welche unterschätzte Auswirkung von ${normalizedTopic} sorgt laut aktuellen Studien für die stärkste gesellschaftliche Reibung?`,
      options: [
        `${normalizedTopic} stärkt vor allem bestehende Machtstrukturen`,
        `${normalizedTopic} löst vor allem wirtschaftliche Turbulenzen aus`,
        `${normalizedTopic} verändert unsere Werteordnung grundlegender als gedacht`,
        `${normalizedTopic} bleibt ohne realen Effekt`
      ],
      correctIndex: 2,
      explanation:
        `Mehrere Metastudien deuten darauf hin, dass ${normalizedTopic} tief in kulturelle Selbstbilder eingreift. Wer sich darauf einlässt, entdeckt, wie fragil vermeintliche Gewissheiten sind.`,
      category: `${normalizedTopic} – Kulturshock`,
      intensity: index % 3 === 0 ? 'mind-blown' : 'shock',
      suggestedHashtags: ['#Tacheles', `#${normalizedTopic.replace(/\s+/g, '')}`]
    },
    {
      id: `custom-power-${index}`,
      prompt: `Was verschweigen Debatten über ${normalizedTopic} laut kritischen Stimmen am hartnäckigsten?`,
      options: [
        'Wer die ökonomischen Gewinner sind',
        'Welche marginalisierten Gruppen die Rechnung zahlen',
        'Welche Narrative gezielt verbreitet werden',
        'Es wird nichts verschwiegen'
      ],
      correctIndex: 1,
      explanation:
        `Investigative Analysen zeigen, dass marginalisierte Gruppen die Nebenwirkungen von ${normalizedTopic} oft zuerst spüren. Das Narrativ der Neutralität zerbricht unter genauerem Hinsehen.`,
      category: `${normalizedTopic} – Machtfragen`,
      intensity: 'deep-dive'
    },
    {
      id: `custom-future-${index}`,
      prompt: `Welcher Reality-Check zu ${normalizedTopic} bringt laut Zukunftsforschung den größten Bewusstseinssprung?`,
      options: [
        `${normalizedTopic} zwingt uns, Komfortzonen zu verlassen`,
        `${normalizedTopic} entlarvt blinde Flecken der Bildung`,
        `${normalizedTopic} zeigt, wie eng Wohlstand und Ausbeutung verknüpft sind`,
        `${normalizedTopic} ist nur kurzfristiger Trend`
      ],
      correctIndex: 2,
      explanation:
        `Zukunftsforscher:innen betonen, dass Wohlstand selten ohne Verdrängung funktioniert. ${normalizedTopic} wird zum Spiegel für verdrängte Zusammenhänge – genau der Stoff für virale Aha-Momente.`,
      category: `${normalizedTopic} – Zukunft`,
      intensity: 'mind-blown'
    }
  ];
  return templates[index % templates.length];
}

function generateCustomQuestions(topic: string, amount: number): Question[] {
  const sanitized = topic.trim();
  if (!sanitized) {
    return shuffle(MIX_QUESTIONS).slice(0, amount);
  }

  const questions: Question[] = [];
  for (let i = 0; i < amount; i += 1) {
    questions.push(buildCustomQuestion(sanitized, i));
  }

  const remixedMix = shuffle(MIX_QUESTIONS).slice(0, Math.max(0, amount - questions.length));
  return shuffle([...questions, ...remixedMix]).slice(0, amount);
}

function useCountdown(key: string, duration: number, onExpire: () => void) {
  const [timeLeft, setTimeLeft] = useState(duration);

  useEffect(() => {
    setTimeLeft(duration);
  }, [duration, key]);

  useEffect(() => {
    if (timeLeft <= 0) {
      onExpire();
      return undefined;
    }

    const interval = window.setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          window.clearInterval(interval);
          onExpire();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => window.clearInterval(interval);
  }, [timeLeft, onExpire]);

  return timeLeft;
}

export default function App() {
  const [mode, setMode] = useState<GameMode | null>(null);
  const [topic, setTopic] = useState('');
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [lives, setLives] = useState(TOTAL_LIVES);
  const [score, setScore] = useState(0);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [showExplanation, setShowExplanation] = useState(false);
  const [jokerState, setJokerState] = useState<JokerState>({ spotlightUsed: false, skipUsed: false });
  const [disabledOptions, setDisabledOptions] = useState<number[]>([]);
  const [roundKey, setRoundKey] = useState('initial');

  const currentQuestion = questions[currentIndex];
  const rank = useMemo(() => getRank(score), [score]);

  const timeLeft = useCountdown(roundKey, QUESTION_TIME, () => {
    if (!showExplanation && questions.length > 0) {
      handleAnswer(-1);
    }
  });

  useEffect(() => {
    if (mode === 'mix') {
      setQuestions(shuffle(MIX_QUESTIONS).slice(0, QUESTIONS_PER_GAME));
      setCurrentIndex(0);
      setLives(TOTAL_LIVES);
      setScore(0);
      setSelectedOption(null);
      setShowExplanation(false);
      setDisabledOptions([]);
      setJokerState({ spotlightUsed: false, skipUsed: false });
      setRoundKey(`mix-${Date.now()}`);
    }
  }, [mode]);

  useEffect(() => {
    if (mode === 'custom' && topic.trim()) {
      setQuestions(generateCustomQuestions(topic, QUESTIONS_PER_GAME));
      setCurrentIndex(0);
      setLives(TOTAL_LIVES);
      setScore(0);
      setSelectedOption(null);
      setShowExplanation(false);
      setDisabledOptions([]);
      setJokerState({ spotlightUsed: false, skipUsed: false });
      setRoundKey(`custom-${topic}-${Date.now()}`);
    }
  }, [mode, topic]);

  function handleStartCustom() {
    if (!topic.trim()) {
      return;
    }
    setMode('custom');
  }

  function handleAnswer(optionIndex: number) {
    if (!currentQuestion || showExplanation) {
      return;
    }

    const isCorrect = optionIndex === currentQuestion.correctIndex;
    const lostLife = !isCorrect;

    setSelectedOption(optionIndex);
    setShowExplanation(true);

    if (isCorrect) {
      setScore((prev) => prev + 1);
    } else if (lostLife) {
      setLives((prev) => Math.max(0, prev - 1));
    }
  }

  function handleNextQuestion() {
    if (lives <= 0) {
      setSelectedOption(null);
      setDisabledOptions([]);
      setShowExplanation(false);
      return;
    }

    if (currentIndex + 1 >= questions.length) {
      setSelectedOption(null);
      setDisabledOptions([]);
      setCurrentIndex(questions.length);
      setShowExplanation(false);
      return;
    }

    setCurrentIndex((prev) => prev + 1);
    setSelectedOption(null);
    setShowExplanation(false);
    setDisabledOptions([]);
    setRoundKey(`${mode ?? 'mix'}-${Date.now()}`);
  }

  function handleReset() {
    setMode(null);
    setTopic('');
    setQuestions([]);
    setCurrentIndex(0);
    setLives(TOTAL_LIVES);
    setScore(0);
    setSelectedOption(null);
    setShowExplanation(false);
    setJokerState({ spotlightUsed: false, skipUsed: false });
    setDisabledOptions([]);
    setRoundKey('reset');
  }

  function handleSpotlight() {
    if (!currentQuestion || jokerState.spotlightUsed || showExplanation) {
      return;
    }
    const incorrectOptions = currentQuestion.options
      .map((_, idx) => idx)
      .filter((idx) => idx !== currentQuestion.correctIndex && !disabledOptions.includes(idx));

    const toDisable = shuffle(incorrectOptions).slice(0, 2);
    setDisabledOptions((prev) => [...prev, ...toDisable]);
    setJokerState((prev) => ({ ...prev, spotlightUsed: true }));
  }

  function handleSkip() {
    if (jokerState.skipUsed || showExplanation) {
      return;
    }
    setJokerState((prev) => ({ ...prev, skipUsed: true }));
    setShowExplanation(true);
    setSelectedOption(null);
  }

  const progress = questions.length ? (currentIndex + (showExplanation ? 1 : 0)) / questions.length : 0;
  const outOfLives = lives <= 0;
  const completed = currentIndex >= questions.length;
  const showOverlay = (outOfLives || completed) && !showExplanation;

  return (
    <div className="app-shell">
      <header className="top-bar">
        <div className="lives">
          {Array.from({ length: TOTAL_LIVES }).map((_, index) => (
            <span
              key={`heart-${index}`}
              className={`heart ${index < lives ? 'heart--full' : 'heart--empty'}`}
            >
              ❤
            </span>
          ))}
        </div>
        <div className="progress">
          <div className="progress-info">
            <span className="progress-count">
              {Math.min(currentIndex + 1, questions.length)}/{questions.length || QUESTIONS_PER_GAME}
            </span>
            <span className="progress-label">Bewusstseins-Booster</span>
          </div>
          <div className="progress-track">
            <div className="progress-fill" style={{ width: `${progress * 100}%` }} />
          </div>
        </div>
        <div className="meta">
          <div className="meta-item">
            <span className="meta-icon">⚡</span>
            <span className="meta-value">{score} Aha</span>
          </div>
          <div className="meta-item">
            <span className="meta-icon">🏆</span>
            <span className="meta-value">{rank.label}</span>
          </div>
        </div>
      </header>

      {mode === null && (
        <main className="landing">
          <h1>Fragen wir Tacheles</h1>
          <p className="tagline">
            Das interaktive Bewusstseinsquiz, das Narrative sprengt, Fakten droppt und deine Community mit viralen
            Reactions versorgt.
          </p>
          <div className="mode-panel">
            <button className="primary" type="button" onClick={() => setMode('mix')}>
              🔥 Mix-Modus starten
            </button>
            <div className="divider">ODER</div>
            <div className="custom-form">
              <label htmlFor="topic">Dein Themenfeld</label>
              <input
                id="topic"
                value={topic}
                onChange={(event) => setTopic(event.target.value)}
                placeholder="z. B. Lieferketten, Bildung, Tech-Macht ..."
              />
              <button className="secondary" type="button" onClick={handleStartCustom} disabled={!topic.trim()}>
                🎯 Tacheles zu diesem Thema
              </button>
            </div>
          </div>
          <section className="promise">
            <h2>So wird&apos;s viral</h2>
            <ul>
              <li>Kontroverse, aber belegbare Fragen – keine Clickbait-Lügen.</li>
              <li>On-Cam Reaktionen dank 60-Sekunden-Druck und Lifelines.</li>
              <li>Kurze Erklärungen liefern den erhellenden Mindshift fürs Publikum.</li>
            </ul>
          </section>
        </main>
      )}

      {mode !== null && !showOverlay && currentQuestion && (
        <main className="stage">
          <aside className="question-meta">
            <span className="category-chip" style={{ borderColor: intensityColor[currentQuestion.intensity] }}>
              {currentQuestion.category}
            </span>
            <span className="intensity" style={{ color: intensityColor[currentQuestion.intensity] }}>
              {currentQuestion.intensity === 'shock' && 'Schock-Faktor'}
              {currentQuestion.intensity === 'deep-dive' && 'Deep Dive'}
              {currentQuestion.intensity === 'mind-blown' && 'Mind-Blown'}
            </span>
          </aside>

          <section className="question-card">
            <div className="timer-ring">
              <svg viewBox="0 0 120 120">
                <circle className="timer-bg" cx="60" cy="60" r="54" />
                <circle
                  className="timer-progress"
                  cx="60"
                  cy="60"
                  r="54"
                  strokeDasharray={2 * Math.PI * 54}
                  strokeDashoffset={((QUESTION_TIME - timeLeft) / QUESTION_TIME) * 2 * Math.PI * 54}
                />
              </svg>
              <span className="timer-value">{timeLeft}</span>
            </div>
            <h2>{currentQuestion.prompt}</h2>

            <div className="answers-grid">
              {currentQuestion.options.map((option, index) => {
                const isCorrect = index === currentQuestion.correctIndex;
                const isSelected = selectedOption === index;
                const isDisabled = disabledOptions.includes(index);

                let answerClass = 'answer';
                if (showExplanation) {
                  if (isCorrect) {
                    answerClass += ' answer--correct';
                  } else if (isSelected) {
                    answerClass += ' answer--wrong';
                  }
                } else if (isDisabled) {
                  answerClass += ' answer--disabled';
                }

                return (
                  <button
                    key={option}
                    type="button"
                    className={answerClass}
                    onClick={() => handleAnswer(index)}
                    disabled={showExplanation || isDisabled}
                  >
                    <span className="answer-index">{index + 1}</span>
                    <span className="answer-text">{option}</span>
                  </button>
                );
              })}
            </div>
          </section>

          <aside className="sidebar">
            <div className="joker-panel">
              <h3>Joker</h3>
              <button
                type="button"
                className="joker-button"
                disabled={jokerState.spotlightUsed || showExplanation}
                onClick={handleSpotlight}
              >
                🔦 Wahrheits-Spotlight
                <span>blendet 2 falsche Antworten aus</span>
              </button>
              <button
                type="button"
                className="joker-button"
                disabled={jokerState.skipUsed || showExplanation}
                onClick={handleSkip}
              >
                🛡️ Reality Shield
                <span>überspringt die Frage einmalig</span>
              </button>
            </div>

            <div className="rank-card">
              <h3>{rank.label}</h3>
              <p>{rank.description}</p>
            </div>
          </aside>
        </main>
      )}

      {mode !== null && currentQuestion && showExplanation && (
        <footer className="explanation">
          <div className="explanation-content">
            <h3>Warum das sitzt:</h3>
            <p>{currentQuestion.explanation}</p>
            {currentQuestion.suggestedHashtags && (
              <p className="hashtags">
                {currentQuestion.suggestedHashtags.map((tag) => (
                  <span key={tag}>{tag}</span>
                ))}
              </p>
            )}
          </div>
          <div className="explanation-actions">
            <button type="button" className="secondary" onClick={handleNextQuestion}>
              Weiter geht&apos;s
            </button>
          </div>
        </footer>
      )}

      {mode !== null && showOverlay && (
        <div className="overlay">
          <div className="overlay-card">
            <h2>Game Over – oder Game On?</h2>
            <p>
              Du hast {score} von {questions.length} Wahrheiten geknackt und rangierst als <strong>{rank.label}</strong>.
              {rank.description ? ` ${rank.description}` : ''}
            </p>
            <ul className="share-tips">
              <li>Clippe den krassesten Aha-Moment für deine Community.</li>
              <li>Nutze Hashtags wie <code>#FragenWirTacheles</code> für Reichweite.</li>
              <li>Starte eine neue Runde mit einem eigenen Thema und überrasche dein Gegenüber.</li>
            </ul>
            <div className="overlay-actions">
              <button type="button" className="primary" onClick={handleReset}>
                Neue Session
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
