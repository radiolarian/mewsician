import { Mongo } from 'meteor/mongo';

// Make example collection posts from the chip
// used in the demo app / debugging the API

export const Posts = new Mongo.Collection('posts');

  /* schema:
   * - time
   * - data
   **/
