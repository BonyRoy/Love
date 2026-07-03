import { useState } from "react";
import { Link } from "react-router-dom";
import { Brain, ArrowLeft, RotateCcw } from "lucide-react";
import { Icon } from "../components/Icon";
import { useContent } from "../context/ContentContext";

export default function LoveQuiz() {
  const { quizQuestions } = useContent();
  const [current, setCurrent] = useState(0);
  const [score, setScore] = useState(0);
  const [selected, setSelected] = useState(null);
  const [finished, setFinished] = useState(false);

  const question = quizQuestions[current];

  const pick = (index) => {
    if (selected !== null) return;
    setSelected(index);
    if (index === question.answer) setScore((s) => s + 1);
  };

  const next = () => {
    if (current + 1 >= quizQuestions.length) {
      setFinished(true);
    } else {
      setCurrent((c) => c + 1);
      setSelected(null);
    }
  };

  const restart = () => {
    setCurrent(0);
    setScore(0);
    setSelected(null);
    setFinished(false);
  };

  const getResult = () => {
    const pct = score / quizQuestions.length;
    if (pct === 1) return "Perfect score! You know us inside out!";
    if (pct >= 0.6) return "Pretty great! We know each other well.";
    return "Room to learn more about us — that's the fun part!";
  };

  if (finished) {
    return (
      <div className="page game-page">
        <Link to="/games" className="back-link">
          <Icon icon={ArrowLeft} size={16} />
          Back to games
        </Link>
        <div className="section game-section">
          <h2 className="section-title">Quiz Complete!</h2>
          <p className="quiz-final-score">
            {score} / {quizQuestions.length}
          </p>
          <p className="game-result-msg">{getResult()}</p>
          <button className="btn-primary" onClick={restart}>
            <Icon icon={RotateCcw} size={18} />
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="page game-page">
      <Link to="/games" className="back-link">
        <Icon icon={ArrowLeft} size={16} />
        Back to games
      </Link>

      <div className="section game-section">
        <h2 className="section-title">
          <Icon icon={Brain} size={22} className="section-title-icon" />
          Love Quiz
        </h2>
        <p className="section-sub">
          Question {current + 1} of {quizQuestions.length}
        </p>

        <div className="quiz-progress">
          <div
            className="quiz-progress-bar"
            style={{
              width: `${((current + 1) / quizQuestions.length) * 100}%`,
            }}
          />
        </div>

        <p className="quiz-question">{question.question}</p>

        <div className="quiz-options">
          {question.options.map((opt, i) => {
            let cls = "quiz-option";
            if (selected !== null) {
              if (i === question.answer) cls += " correct";
              else if (i === selected) cls += " wrong";
            }
            return (
              <button key={i} className={cls} onClick={() => pick(i)}>
                {opt}
              </button>
            );
          })}
        </div>

        {selected !== null && (
          <button className="btn-primary quiz-next" onClick={next}>
            {current + 1 >= quizQuestions.length
              ? "See Results"
              : "Next Question"}
          </button>
        )}
      </div>
    </div>
  );
}
