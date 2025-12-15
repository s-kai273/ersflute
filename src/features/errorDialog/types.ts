export type ErrorDialogContent = {
  title: string;
  message: string;
  details?: string;
};

export type ShowErrorDialogOptions = {
  title?: string;
  message?: string;
  context?: string;
};
