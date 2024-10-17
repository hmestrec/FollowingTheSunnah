// Amplify Configuration
Amplify.configure({
    Auth: {
        region: 'us-east-1', // Your region
        userPoolId: 'us-east-1_jcjKwG4JA', // Your Cognito User Pool ID
        userPoolWebClientId: '38bb82epf2rmhpvbnhck7uoa6b', // Your Cognito App Client ID
    }
});

// Check if user is authenticated
async function checkAuth() {
    try {
        const user = await Amplify.Auth.currentAuthenticatedUser();
        console.log('User is authenticated:', user);
    } catch (error) {
        console.log('No user is authenticated, redirecting to login.');
        window.location.href = 'https://followingsunnahlogin.auth.us-east-1.amazoncognito.com/login?client_id=38bb82epf2rmhpvbnhck7uoa6b&response_type=code&scope=aws.cognito.signin.user.admin&redirect_uri=https%3A%2F%2Ffollowingsunnah.net%2Fediting.html';
    }
}

// Execute command for editor formatting
function execCmd(command) {
    document.execCommand(command, false, null);
}

// Run the auth check when the page loads
window.onload = function() {
    console.log('Checking authentication status...');
    checkAuth();
};
