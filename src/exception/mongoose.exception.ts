import { Catch, ConflictException, ExceptionFilter } from '@nestjs/common';
import { MongoError } from 'mongodb';

@Catch(MongoError)
export class MongoExceptionFilter implements ExceptionFilter {
  catch(exception: MongoError) {
    switch (exception.code) {
      case 11000:
        // Handle duplicate key error (error code 11000)
        // You can implement logging, notifying the user, or retrying the operation here
        throw new ConflictException('Duplicate key error occurred.');
      default:
        // For other MongoDB errors, you can handle them as needed
        throw new ConflictException('An error occurred in MongoDB.');
    }
  }
}
