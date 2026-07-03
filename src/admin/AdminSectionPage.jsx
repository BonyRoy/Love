import { Navigate, useParams } from "react-router-dom";
import { useContent } from "../context/ContentContext";
import { getSectionById } from "./sections";
import StringListEditor from "./editors/StringListEditor";
import ObjectListEditor from "./editors/ObjectListEditor";
import MetaEditor from "./editors/MetaEditor";
import MoodEditor from "./editors/MoodEditor";
import QuizEditor from "./editors/QuizEditor";
import SecretHeartEditor from "./editors/SecretHeartEditor";
import JsonEditor from "./editors/JsonEditor";

export default function AdminSectionPage() {
  const { sectionId } = useParams();
  const section = getSectionById(sectionId);
  const { raw, updateSection, updateSections } = useContent();

  if (!section) return <Navigate to="/admin" replace />;

  const savePath = async (value) => {
    await updateSection(section.path, value);
  };

  if (section.type === "meta") {
    return (
      <MetaEditor
        raw={raw}
        onSave={async (patch) => {
          await updateSections(patch);
        }}
      />
    );
  }

  if (section.type === "stringList") {
    return (
      <StringListEditor
        title={section.title}
        items={raw[section.path] ?? []}
        itemLabel={section.itemLabel}
        onSave={savePath}
      />
    );
  }

  if (section.type === "objectList") {
    return (
      <ObjectListEditor
        title={section.title}
        items={raw[section.path] ?? []}
        fields={section.fields}
        onSave={savePath}
      />
    );
  }

  if (section.type === "moodMap") {
    return (
      <MoodEditor
        title={section.title}
        moods={raw[section.path] ?? {}}
        onSave={savePath}
      />
    );
  }

  if (section.type === "quizList") {
    return (
      <QuizEditor
        title={section.title}
        items={raw[section.path] ?? []}
        onSave={savePath}
      />
    );
  }

  if (section.type === "secretHeart") {
    return (
      <SecretHeartEditor
        data={raw[section.path] ?? {}}
        onSave={savePath}
      />
    );
  }

  if (section.type === "json") {
    return (
      <JsonEditor
        title={section.title}
        value={raw[section.path] ?? {}}
        onSave={savePath}
      />
    );
  }

  return <p>Unknown editor type.</p>;
}
