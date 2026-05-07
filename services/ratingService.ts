
import { 
  collection, 
  addDoc, 
  query, 
  where, 
  onSnapshot, 
  serverTimestamp, 
  getDocs,
  Timestamp,
  deleteDoc,
  doc
} from 'firebase/firestore';
import { db, auth, handleFirestoreError, OperationType } from '../firebase';

export interface Rating {
  id?: string;
  userId: string;
  userDisplayName: string;
  targetId: string;
  targetName: string;
  rating: number;
  comment: string;
  createdAt: any;
}

const COLLECTION_NAME = 'ratings';

export const submitRating = async (targetId: string, targetName: string, rating: number, comment: string) => {
  if (!auth.currentUser) throw new Error('You must be signed in to rate.');

  const ratingData = {
    userId: auth.currentUser.uid,
    userDisplayName: auth.currentUser.displayName || 'Anonymous Traveler',
    targetId,
    targetName,
    rating,
    comment,
    createdAt: serverTimestamp(),
  };

  try {
    const docRef = await addDoc(collection(db, COLLECTION_NAME), ratingData);
    return docRef.id;
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, COLLECTION_NAME);
  }
};

export const getRatingsForTarget = (targetId: string, callback: (ratings: Rating[]) => void) => {
  const q = query(
    collection(db, COLLECTION_NAME),
    where('targetId', '==', targetId)
  );

  return onSnapshot(q, (snapshot) => {
    const ratings = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as Rating[];
    callback(ratings);
  }, (error) => {
    handleFirestoreError(error, OperationType.LIST, COLLECTION_NAME);
  });
};

export const deleteRating = async (ratingId: string) => {
  try {
    await deleteDoc(doc(db, COLLECTION_NAME, ratingId));
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, `${COLLECTION_NAME}/${ratingId}`);
  }
};
