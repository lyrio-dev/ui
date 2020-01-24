import { SemanticICONS } from "semantic-ui-react";

export default function getFileIcon(filename: string): SemanticICONS {
  const suffixIconMap: Record<string, SemanticICONS> = {
    ".cpp": "file code outline",
    ".c": "file code outline",
    ".cs": "file code outline",
    ".pas": "file code outline",
    ".py": "file code outline",
    ".js": "file code outline",
    ".java": "file code outline",
    ".hs": "file code outline",
    ".vala": "file code outline",
    ".lua": "file code outline",
    ".rb": "file code outline",
    ".vb": "file code outline",
    ".ml": "file code outline",
    ".in": "file alternate outline",
    ".out": "file alternate outline",
    ".ans": "file alternate outline",
    ".txt": "file alternate outline",
    ".md": "file alternate outline",
    ".docx": "file word outline",
    ".odt": "file word outline",
    ".xlsx": "file excel outline",
    ".ods": "file excel outline",
    ".pptx": "file powerpoint outline",
    ".odp": "file powerpoint outline",
    ".pdf": "file pdf outline",
    ".zip": "file archive outline",
    ".7z": "file archive outline",
    ".bmp": "file image outline",
    ".ico": "file image outline",
    ".jpg": "file image outline",
    ".jpeg": "file image outline",
    ".png": "file image outline",
    ".avi": "file video outline",
    ".mp4": "file video outline",
    ".wmv": "file video outline",
    ".webm": "file video outline",
    ".ogv": "file video outline",
    ".flv": "file video outline",
    ".mp3": "file audio outline",
    ".ogg": "file audio outline",
    ".wav": "file audio outline",
    ".flac": "file audio outline",
    ".mpg": "file audio outline"
  };

  for (const suffix in suffixIconMap) if (filename.endsWith(suffix)) return suffixIconMap[suffix];

  return "file outline";
}
