import { CodeLanguage } from "@/interfaces/CodeLanguage";
import { SubmissionFullInfo } from "../SubmissionPage";
import { useIntlMessage } from "@/utils/hooks";

type IntlMessageFormatter = ReturnType<typeof useIntlMessage>;

export interface TestcaseResultCommon {
  testcaseInfo?: {
    timeLimit?: number;
    memoryLimit?: number;
    inputFilename?: string;
    outputFilename?: string;
  };
  status: string;
  score: number;
  time?: number;
  memory?: number;
  input?: string;
  output?: string;
  userOutput?: string;
  userError?: string;
  systemMessage?: string;
}

export type GetAdditionalSectionsCallback<TestcaseResult extends TestcaseResultCommon = TestcaseResultCommon> = (
  testcaseResult: TestcaseResult
) => React.ReactNode;

export interface ProblemTypeSubmissionViewProps<TestcaseResult extends TestcaseResultCommon, SubmissionContent> {
  content: SubmissionContent;
  fullInfo: SubmissionFullInfo<TestcaseResult>;
  getCompilationMessage: () => React.ReactElement;
  getSystemMessage: () => React.ReactElement;
  getSubtasksView: (getAdditionalSections: GetAdditionalSectionsCallback<TestcaseResult>) => React.ReactElement;
}

export interface ProblemTypeSubmissionViewHelper<SubmissionContent> {
  getAnswerInfo: (content: SubmissionContent, _: IntlMessageFormatter) => React.ReactNode;
  getHighlightLanguageList: (content: SubmissionContent) => CodeLanguage[];
}

export type ProblemTypeSubmissionView = React.FC<ProblemTypeSubmissionViewProps<TestcaseResultCommon, unknown>> &
  ProblemTypeSubmissionViewHelper<unknown>;
