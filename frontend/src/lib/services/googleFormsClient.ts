// TODO: configure Google Workspace credentials (service account recommended for server-to-server)
// Docs: https://developers.google.com/forms/api/reference/rest
// TODO: add `googleapis` package when ready to implement

export interface GoogleFormAnswer {
  questionId: string
  textAnswers?: { answers: Array<{ value: string }> }
}

export interface GoogleFormResponse {
  responseId: string
  createTime: string
  lastSubmittedTime: string
  answers: Record<string, GoogleFormAnswer>
}

export interface GoogleFormsClientConfig {
  formId: string
  credentials: {
    clientEmail: string
    privateKey: string
  }
}

export class GoogleFormsClient {
  private readonly config: GoogleFormsClientConfig

  // TODO: initialize Google Auth client (JWT strategy with service account)
  constructor(config: GoogleFormsClientConfig) {
    this.config = config
  }

  async listResponses(_pageToken?: string): Promise<GoogleFormResponse[]> {
    // TODO: authenticate and call:
    // GET https://forms.googleapis.com/v1/forms/{formId}/responses
    // Handle pagination via nextPageToken
    void this.config
    throw new Error('Not implemented')
  }

  async getResponse(_responseId: string): Promise<GoogleFormResponse> {
    // TODO: authenticate and call:
    // GET https://forms.googleapis.com/v1/forms/{formId}/responses/{responseId}
    void this.config
    throw new Error('Not implemented')
  }
}
