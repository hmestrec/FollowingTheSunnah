import { signOut, getCurrentUser } from '@aws-amplify/auth'; // Import specific methods

const EditingPage = () => {
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const checkUser = async () => {
      try {
        const authUser = await getCurrentUser(); // Use correct method
        setUser(authUser);
      } catch (error) {
        navigate('/login');
      }
    };

    checkUser();
  }, [navigate]);

  const handleSignOut = async () => {
    await signOut(); // Use correct method
    navigate('/login');
  };

  if (!user) return <div>Loading...</div>;

  return (
    <div>
      <h1>Welcome to the Editing Page, {user.username}</h1>
      <button onClick={handleSignOut}>Sign Out</button>
    </div>
  );
};

export default EditingPage;
