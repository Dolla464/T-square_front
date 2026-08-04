import { resolveQuestionImageUrl } from "../../utils/questionFormHelpers";
import "./questionContent.css";

const DEFAULT_LANGUAGE = "code";

function QuestionContent({ question, className = "" }) {
  if (!question) return null;

  const text = question.question_text || question.question || null;
  const imageUrl = resolveQuestionImageUrl(question);
  const code = question.question_code || null;
  const language = question.question_code_language || DEFAULT_LANGUAGE;

  const hasContent = Boolean(text || imageUrl || code);
  if (!hasContent) return null;

  return (
    <div className={`question-content ${className}`.trim()}>
      {text ? <p className="question-content-text">{text}</p> : null}

      {imageUrl ? (
        <figure className="question-content-image-wrap">
          <img
            src={imageUrl}
            alt={text || "Question illustration"}
            className="question-content-image"
            loading="lazy"
          />
        </figure>
      ) : null}

      {code ? (
        <div className="question-code-block">
          <div className="question-code-header">
            <span>{language}</span>
          </div>
          <pre className="question-code-pre">
            <code>{code}</code>
          </pre>
        </div>
      ) : null}
    </div>
  );
}

export default QuestionContent;
