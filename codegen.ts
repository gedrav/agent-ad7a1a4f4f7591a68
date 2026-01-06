import type { CodegenConfig } from '@graphql-codegen/cli';
import * as dotenv from 'dotenv';
dotenv.config({ path: '.env.development' });

const schema = process.env.VITE_API_URL + '/graphql';

if (!schema) {
  throw new Error('Make sure graphql api url is provided as environment variable!');
}

const config: CodegenConfig = {
  schema,
  overwrite: true,
  ignoreNoDocuments: true,
  documents: './src/corelib/models/services/graphqlClient/gql/*.gql',
  generates: {
    './src/corelib/models/services/graphqlClient/generated/graphql.ts': {
      plugins: ['typescript', 'typescript-operations', 'typescript-graphql-request'],
    },
  },
};

export default config;
