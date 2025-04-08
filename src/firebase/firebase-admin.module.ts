// import { Module, Global } from '@nestjs/common';
// import * as admin from 'firebase-admin';
// import { ServiceAccount } from 'firebase-admin';
// const serviceAccount = require('./serviceAccountKey.json') as ServiceAccount;

// @Global()
// @Module({
//   providers: [
//     {
//       provide: 'FIREBASE_ADMIN',
//       useValue: admin.initializeApp({
//         credential: admin.credential.cert(serviceAccount as admin.ServiceAccount),
//       }),
//     },
//   ],
//   exports: ['FIREBASE_ADMIN'],
// })
// export class FirebaseAdminModule {}
