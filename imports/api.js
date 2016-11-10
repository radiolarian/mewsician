import { Mongo } from 'meteor/mongo';

// Hold generated user API keys for file upload

export const APIKeys = Mongo.Collection('apikeys');
  /* schema:
   * - user
   * - key
   **/
