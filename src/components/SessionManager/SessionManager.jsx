import React, { useEffect, useRef, useState } from "react";
import { Auth } from "@aws-amplify/auth"; // Import Auth from Amplify
import styles from "./Modal.module.css";

const SessionManager = ({ user, setUser, children }) => {
  const [isInactive, setIsInactive] = useState(false); // Track inactivity state
  const timers = useRef({ inactivity: null, warning: null }); // Manage timers

  const clearTimers = () => {
    clearTimeout(timers.current.inactivity);
    clearTimeout(timers.current.warning);
    timers.current.inactivity = null;
    timers.current.warning = null;
  };

  const handleSignOut = async () => {
    clearTimers();
    setIsInactive(false);

    try {
      await Auth.signOut(); // Sign out from AWS Amplify
      setUser(null); // Update local user state
      window.location.reload(); // Refresh the page after logout
    } catch (error) {
      console.error("[ERROR] Sign-out failed:", error);
    }
  };

  const startInactivityTimer = () => {
    if (!user || timers.current.inactivity) return;

    timers.current.inactivity = setTimeout(() => {
      setIsInactive(true);

      timers.current.warning = setTimeout(() => {
        handleSignOut();
      }, 30000); // 30 seconds warning
    }, 300000); // 5 minutes inactivity
  };

  const resetTimers = () => {
    if (!user || !isInactive) return;
    setIsInactive(false); // Hide the modal
    clearTimers();
    startInactivityTimer();
  };

  useEffect(() => {
    const handleActivity = () => resetTimers();
    window.addEventListener("mousemove", handleActivity);
    window.addEventListener("keydown", handleActivity);

    return () => {
      clearTimers();
      window.removeEventListener("mousemove", handleActivity);
      window.removeEventListener("keydown", handleActivity);
    };
  }, []);

  useEffect(() => {
    if (user) {
      startInactivityTimer();
    } else {
      clearTimers();
    }
  }, [user]);

  useEffect(() => {
    const handleEscapeKey = (event) => {
      if (event.key === "Escape" && isInactive) {
        resetTimers();
      }
    };

    window.addEventListener("keydown", handleEscapeKey);
    return () => window.removeEventListener("keydown", handleEscapeKey);
  }, [isInactive]);

  return (
    <>
      {isInactive && (
        <div
          className={styles.modalBackdrop}
          onClick={resetTimers} // Clicking outside the modal closes it
        >
          <div
            className={styles.modal}
            onClick={(e) => e.stopPropagation()} // Prevent backdrop click when interacting with the modal
          >
            <h2>Inactivity Warning</h2>
            <p>You will be logged out in 30 seconds if no activity is detected.</p>
            <button onClick={resetTimers} className={styles.stayLoggedInButton}>
              STAY LOGGED IN
            </button>
          </div>
        </div>
      )}
      {children}
    </>
  );
};

export default SessionManager;