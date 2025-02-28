import ApiResponse from './api-response';
import Feedback from './feedbacks';

export default class ResponseHelper {
  public static CreateResponse<T>(
    data?: T,
    statusCode?: number,
    message?: string,
    feedbacks?: Feedback[],
  ) {
    return new ApiResponse<T>(message, data, statusCode, feedbacks);
  }
}
