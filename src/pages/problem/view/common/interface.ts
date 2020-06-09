import { SemanticSIZES } from "semantic-ui-react";

export interface ProblemTypeLabelsProps<JudgeInfo> {
  size: SemanticSIZES;
  judgeInfo: JudgeInfo;
}

export interface ProblemTypeSubmitViewProps<JudgeInfo, SubmissionContent = object> {
  judgeInfo: JudgeInfo;
  lastSubmission: ApiTypes.ProblemLastSubmissionDto;

  inSubmitView: boolean;
  pendingSubmit: boolean;
  submissionContent: SubmissionContent;

  onCloseSubmitView: () => void;
  onUpdateSubmissionContent: (path: string, value: unknown) => void;
  onSubmit: () => Promise<void>;
}

export interface ProblemTypeView<JudgeInfo, SubmissionContent = object> {
  Labels: React.FC<ProblemTypeLabelsProps<JudgeInfo>>;
  SubmitView: React.FC<ProblemTypeSubmitViewProps<JudgeInfo, SubmissionContent>>;
  getDefaultSubmissionContent: () => SubmissionContent;
}
