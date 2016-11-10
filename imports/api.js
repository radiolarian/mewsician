import { Mongo } from 'meteor/mongo';

// Hold generated user API keys for file upload

export const APIKeys = new Mongo.Collection('apikeys');
  /* schema:
   * - user
   * - key
   **/
