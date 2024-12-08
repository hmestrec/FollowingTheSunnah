import React, { createContext, useState, useEffect, useContext } from 'react';
import { Auth } from '@aws-amplify/auth';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Fetch user at mount
    const checkUser = async () => {
      try {
        const currentUser = await Auth.currentAuthenticatedUser();
        setUser(currentUser);
      } catch {
        setUser(null); // User is not signed in
      } finally {
        setLoading(false);
      }
    };

    checkUser();

    // Poll for user state every 5 seconds as a workaround for Hub
    const interval = setInterval(async () => {
      try {
        const currentUser = await Auth.currentAuthenticatedUser();
        setUser((prevUser) => (prevUser !== currentUser ? currentUser : prevUser));
      } catch {
        setUser(null);
      }
    }, 5000);

    return () => clearInterval(interval); // Cleanup interval on unmount
  }, []);

  const signIn = async (username, password) => {
    try {
      const signedInUser = await Auth.signIn(username, password);
      setUser(signedInUser);
      return signedInUser;
    } catch (error) {
      throw error;
    }
  };

  const signOut = async () => {
    try {
      await Auth.signOut();
      setUser(null);
    } catch (error) {
      throw error;
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, signIn, signOut }}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
