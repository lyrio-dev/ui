export enum SubmissionProgressType {
  Preparing = "Preparing",
  Compiling = "Compiling",
  Running = "Running",
  Finished = "Finished"
}

export interface SubmissionProgressMessageMetaOnly {
  progressMeta?: {
    progressType: SubmissionProgressType;
    resultMeta?: ApiTypes.SubmissionMetaDto;
  };
}
