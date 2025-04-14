import React, { useState, useEffect } from 'react';
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';
import JsonSpreadsheetEditor from './components/JsonSpreadsheetEditor';
import Button from '@mui/material/Button';
import Box from '@mui/material/Box';
import CircularProgress from '@mui/material/CircularProgress';
import GitHubIcon from '@mui/icons-material/GitHub';
import Alert from '@mui/material/Alert';

/**
 * GitHub authentication configuration
 */
const GITHUB_CLIENT_ID = import.meta.env.VITE_GITHUB_CLIENT_ID as string;
const REDIRECT_URI = window.location.origin; // Uses current origin for redirection

/**
 * Interface for authenticated user data
 */
interface User {
  login: string;
  name: string;
  avatar_url: string;
}

/**
 * Main application component
 */
const App: React.FC = () => {
  // Authentication state
  const [token, setToken] = useState<string | null>(localStorage.getItem('github_token'));
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // JSON file management state
  /**
   * List of JSON files in the repo directory
   */
  const [files, setFiles] = useState<any[]>([]);
  /**
   * Name of the currently selected file
   */
  const [selectedFile, setSelectedFile] = useState<string | null>(null);
  /**
   * Content of the currently selected file
   */
  const [fileContent, setFileContent] = useState<string | null>(null);
  /**
   * Editable content for the currently selected file
   */
  const [editContent, setEditContent] = useState<string>('');
  /**
   * Metadata for the currently selected file
   */
  const [fileMeta, setFileMeta] = useState<any | null>(null);
  /**
   * UI state for create file dialog
   */
  const [showCreate, setShowCreate] = useState<boolean>(false);
  const [newFileName, setNewFileName] = useState<string>('');
  const [newFileContent, setNewFileContent] = useState<string>('{}');
  /**
   * Notification state
   */
  const [notif, setNotif] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  /**
   * UI state for delete confirmation
   */
  const [confirmDelete, setConfirmDelete] = useState<boolean>(false);

  /**
   * Fetches the list of JSON files from the Netlify github function
   */
  const fetchFiles = async () => {
    if (!token) return;
    setLoading(true);
    setError(null);
    try {
      const response = await fetch('/.netlify/functions/github?action=list', {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await response.json();
      if (data.error) throw new Error(data.error);
      setFiles(data.files);
    } catch (err: any) {
      setError('Failed to fetch file list');
      setFiles([]);
    } finally {
      setLoading(false);
    }
  };

  /**
   * Fetches the content of a selected JSON file
   */
  const fetchFileContent = async (fileName: string) => {
    if (!token) return;
    setLoading(true);
    setError(null);
    try {
      setSelectedFile(fileName);
      setFileContent(null);
      const response = await fetch(`/.netlify/functions/github?action=get&file=${encodeURIComponent(fileName)}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await response.json();
      if (data.error) throw new Error(data.error);
      setFileContent(data.file.content);
      setEditContent(data.file.content);
      setFileMeta({
        sha: data.file.sha,
        size: data.file.size,
        lastModified: data.file.git_url ? data.file.git_url : '',
        url: data.file.html_url,
      });
    } catch (err: any) {
      setError('Failed to fetch file content');
      setFileContent(null);
    } finally {
      setLoading(false);
    }
  };

  // Auto-fetch file list after login
  useEffect(() => {
    if (user && token) {
      fetchFiles();
    }
    // eslint-disable-next-line
  }, [user, token]);

  /**
   * Initiates GitHub OAuth login flow
   */
  const loginWithGitHub = (): void => {
    setLoading(true);
    const scope = 'repo'; // Permission to access repositories
    
    // Simplify the redirect URI to match GitHub's expectations
    window.location.href = `https://github.com/login/oauth/authorize?client_id=${GITHUB_CLIENT_ID}&redirect_uri=${REDIRECT_URI}/callback&scope=${scope}`;
    
    console.log('Login URL:', window.location.href); // Debug log
  };

  /**
   * Logs the user out by clearing the token
   */
  const logout = (): void => {
    localStorage.removeItem('github_token');
    setToken(null);
    setUser(null);
  };

  /**
   * Handles the OAuth callback by exchanging the code for a token
   */
  const handleCallback = async (code: string): Promise<void> => {
    try {
      setLoading(true);
      setError(null);
      
      // Call Netlify function to exchange code for token
      const response = await fetch(`/.netlify/functions/auth?code=${code}`);
      const data = await response.json();
      
      if (data.error) {
        throw new Error(data.error);
      }
      
      // Save token and fetch user info
      localStorage.setItem('github_token', data.access_token);
      setToken(data.access_token);
      
    } catch (err) {
      console.error('Authentication error:', err);
      setError('Failed to authenticate with GitHub');
    } finally {
      setLoading(false);
    }
  };

  /**
   * Fetches user information when token changes
   */
  useEffect(() => {
    // Check if we're on the callback route
    if (window.location.pathname === '/callback') {
      // Parse URL for code parameter on initial load
      const urlParams = new URLSearchParams(window.location.search);
      const code = urlParams.get('code');
      
      if (code) {
        // Clear code from URL to prevent reuse
        window.history.replaceState({}, document.title, '/');
        handleCallback(code);
      } else {
        console.error('No code found in callback URL');
        setError('Authorization failed: No code parameter received from GitHub');
      }
    }
    
    // Fetch user information if token exists
    const fetchUserInfo = async () => {
      if (!token) return;
      
      try {
        setLoading(true);
        const response = await fetch('https://api.github.com/user', {
          headers: {
            Authorization: `token ${token}`,
          },
        });
        
        if (!response.ok) {
          throw new Error('Failed to fetch user data');
        }
        
        const userData = await response.json();
        setUser(userData);
      } catch (err) {
        console.error('Error fetching user data:', err);
        setError('Failed to get user information');
        logout(); // Clear invalid token
      } finally {
        setLoading(false);
      }
    };
    
    fetchUserInfo();
  }, [token]);

  return (
    <Container maxWidth="md">
      <Typography variant="h3" component="h1" gutterBottom>
        Bachata Updates Admin
      </Typography>
      
      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}
      
      {loading ? (
        <Box display="flex" justifyContent="center" my={4}>
          <CircularProgress />
        </Box>
      ) : user ? (
        <Box>
          <Box display="flex" alignItems="center" mb={3}>
            <Box 
              component="img" 
              src={user.avatar_url} 
              alt={`${user.login}'s avatar`} 
              sx={{ width: 50, height: 50, borderRadius: '50%', mr: 2 }}
            />
            <Box>
              <Typography variant="h6">{user.name || user.login}</Typography>
              <Typography variant="body2" color="text.secondary">
                @{user.login}
              </Typography>
            </Box>
          </Box>
          
          <Typography variant="body1" mb={3}>
            You're logged in and can now manage JSON updates files.
          </Typography>
          
          {/* JSON File Management UI */}
          <Box display="flex" flexDirection="column" gap={3}>
            {/* File List */}
            <Box>
              <Typography variant="subtitle1" gutterBottom>JSON Files</Typography>
              <Button variant="outlined" size="small" onClick={fetchFiles} sx={{ mb: 1 }}>
                Refresh List
              </Button>
              <Box sx={{ border: '1px solid #ddd', borderRadius: 1, p: 1, maxHeight: 200, overflowY: 'auto' }}>
                {files.length === 0 ? (
                  <Typography variant="body2" color="text.secondary">No files found.</Typography>
                ) : (
                  files.map((f) => (
                    <Button
                      key={f.name}
                      variant={selectedFile === f.name ? 'contained' : 'text'}
                      size="small"
                      fullWidth
                      sx={{ justifyContent: 'flex-start', mb: 0.5 }}
                      onClick={() => fetchFileContent(f.name)}
                    >
                      {f.name}
                    </Button>
                  ))
                )}
              </Box>
            </Box>
            {/* File Content Viewer */}
            <Box width="100%">
              <Typography variant="subtitle1" gutterBottom>File Content</Typography>
              {fileContent && selectedFile ? (
                (() => {
                  let parsed: any = null;
                  try {
                    parsed = JSON.parse(fileContent);
                  } catch (e) { /* ignore */ }
                  // If parsed is an array of objects, use spreadsheet editor
                  if (Array.isArray(parsed) && parsed.length > 0 && typeof parsed[0] === 'object') {
                    return (
                      <JsonSpreadsheetEditor
                        data={parsed}
                        loading={loading}
                        error={error}
                        onSave={async (newData) => {
                          setLoading(true);
                          setNotif(null);
                          try {
                            const resp = await fetch('/.netlify/functions/github', {
                              method: 'POST',
                              headers: {
                                Authorization: `Bearer ${token}`,
                                'Content-Type': 'application/json',
                              },
                              body: JSON.stringify({
                                file: selectedFile,
                                content: JSON.stringify(newData, null, 2),
                                message: `Update ${selectedFile}`,
                              }),
                            });
                            const data = await resp.json();
                            if (data.error) throw new Error(data.error);
                            setNotif({ type: 'success', message: 'File saved successfully!' });
                            fetchFiles();
                            fetchFileContent(selectedFile);
                          } catch (err: any) {
                            setNotif({ type: 'error', message: 'Failed to save file.' });
                          } finally {
                            setLoading(false);
                          }
                        }}
                      />
                    );
                  }
                  // If parsed is an object with a single array property, use spreadsheet editor for that array
                  if (
                    parsed &&
                    typeof parsed === 'object' &&
                    !Array.isArray(parsed) &&
                    Object.keys(parsed).length === 1 &&
                    Array.isArray(parsed[Object.keys(parsed)[0]])
                  ) {
                    const arrayKey = Object.keys(parsed)[0];
                    const arrayData = parsed[arrayKey];
                    return (
                      <JsonSpreadsheetEditor
                        data={arrayData}
                        loading={loading}
                        error={error}
                        onSave={async (newData) => {
                          setLoading(true);
                          setNotif(null);
                          try {
                            const newObj = { ...parsed, [arrayKey]: newData };
                            const resp = await fetch('/.netlify/functions/github', {
                              method: 'POST',
                              headers: {
                                Authorization: `Bearer ${token}`,
                                'Content-Type': 'application/json',
                              },
                              body: JSON.stringify({
                                file: selectedFile,
                                content: JSON.stringify(newObj, null, 2),
                                message: `Update ${selectedFile}`,
                              }),
                            });
                            const data = await resp.json();
                            if (data.error) throw new Error(data.error);
                            setNotif({ type: 'success', message: 'File saved successfully!' });
                            fetchFiles();
                            fetchFileContent(selectedFile);
                          } catch (err: any) {
                            setNotif({ type: 'error', message: 'Failed to save file.' });
                          } finally {
                            setLoading(false);
                          }
                        }}
                      />
                    );
                  } else {
                    // Fallback: textarea editor
                    return (
                      <>
                        {/* File metadata */}
                        <Box mb={1}>
                          <Typography variant="caption" color="text.secondary">
                            <b>Name:</b> {selectedFile}
                            {fileMeta?.size && <> &nbsp; <b>Size:</b> {fileMeta.size} bytes</>}
                            {fileMeta?.url && (
                              <>
                                &nbsp; <a href={fileMeta.url} target="_blank" rel="noopener noreferrer">View on GitHub</a>
                              </>
                            )}
                          </Typography>
                        </Box>
                        <textarea
                          style={{ width: '100%', minHeight: 180, fontFamily: 'monospace', fontSize: 14, marginBottom: 8 }}
                          value={editContent}
                          onChange={e => setEditContent(e.target.value)}
                        />
                        <Box display="flex" gap={1}>
                          <Button variant="contained" color="primary" size="small" onClick={async () => {
                            setLoading(true);
                            setNotif(null);
                            try {
                              const resp = await fetch('/.netlify/functions/github', {
                                method: 'POST',
                                headers: {
                                  Authorization: `Bearer ${token}`,
                                  'Content-Type': 'application/json',
                                },
                                body: JSON.stringify({
                                  file: selectedFile,
                                  content: editContent,
                                  message: `Update ${selectedFile}`,
                                }),
                              });
                              const data = await resp.json();
                              if (data.error) throw new Error(data.error);
                              setNotif({ type: 'success', message: 'File saved successfully!' });
                              fetchFiles();
                              fetchFileContent(selectedFile);
                            } catch (err: any) {
                              setNotif({ type: 'error', message: 'Failed to save file.' });
                            } finally {
                              setLoading(false);
                            }
                          }}>Save</Button>
                          <Button variant="outlined" color="error" size="small" onClick={() => setConfirmDelete(true)}>
                            Delete
                          </Button>
                        </Box>
                      </>
                    );
                  }
                })()
              ) : (
                <Typography variant="body2" color="text.secondary">Select a file to view its content.</Typography>
              )}
              {/* Create new file button */}
              <Button variant="outlined" color="success" size="small" sx={{ mt: 2 }} onClick={() => setShowCreate(true)}>
                + New File
              </Button>
            </Box>
          </Box>

          {/* Create File Dialog */}
          {showCreate && (
            <Box sx={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', bgcolor: 'rgba(0,0,0,0.2)', zIndex: 9999 }} onClick={() => setShowCreate(false)}>
              <Box sx={{ background: '#fff', p: 3, borderRadius: 2, minWidth: 350, maxWidth: 400, mx: 'auto', mt: 12 }} onClick={e => e.stopPropagation()}>
                <Typography variant="h6">Create New JSON File</Typography>
                <input
                  style={{ width: '100%', margin: '8px 0', padding: 6 }}
                  placeholder="File name (e.g. new-update.json)"
                  value={newFileName}
                  onChange={e => setNewFileName(e.target.value)}
                />
                <textarea
                  style={{ width: '100%', minHeight: 100, fontFamily: 'monospace', fontSize: 14 }}
                  value={newFileContent}
                  onChange={e => setNewFileContent(e.target.value)}
                />
                <Box display="flex" gap={1} mt={2}>
                  <Button variant="contained" color="success" size="small" onClick={async () => {
                    setLoading(true);
                    setNotif(null);
                    try {
                      const resp = await fetch('/.netlify/functions/github', {
                        method: 'POST',
                        headers: {
                          Authorization: `Bearer ${token}`,
                          'Content-Type': 'application/json',
                        },
                        body: JSON.stringify({
                          file: newFileName,
                          content: newFileContent,
                          message: `Create ${newFileName}`,
                        }),
                      });
                      const data = await resp.json();
                      if (data.error) throw new Error(data.error);
                      setNotif({ type: 'success', message: 'File created!' });
                      setShowCreate(false);
                      setNewFileName('');
                      setNewFileContent('{}');
                      fetchFiles();
                    } catch (err: any) {
                      setNotif({ type: 'error', message: 'Failed to create file.' });
                    } finally {
                      setLoading(false);
                    }
                  }}>Create</Button>
                  <Button variant="outlined" size="small" onClick={() => setShowCreate(false)}>Cancel</Button>
                </Box>
              </Box>
            </Box>
          )}

          {/* Delete Confirmation Dialog */}
          {confirmDelete && (
            <Box sx={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', bgcolor: 'rgba(0,0,0,0.2)', zIndex: 9999 }} onClick={() => setConfirmDelete(false)}>
              <Box sx={{ background: '#fff', p: 3, borderRadius: 2, minWidth: 320, maxWidth: 380, mx: 'auto', mt: 14 }} onClick={e => e.stopPropagation()}>
                <Typography variant="h6" color="error">Confirm Delete</Typography>
                <Typography>Are you sure you want to delete <b>{selectedFile}</b>?</Typography>
                <Box display="flex" gap={1} mt={2}>
                  <Button variant="contained" color="error" size="small" onClick={async () => {
                    setLoading(true);
                    setNotif(null);
                    try {
                      const resp = await fetch('/.netlify/functions/github', {
                        method: 'DELETE',
                        headers: {
                          Authorization: `Bearer ${token}`,
                          'Content-Type': 'application/json',
                        },
                        body: JSON.stringify({
                          file: selectedFile,
                          message: `Delete ${selectedFile}`,
                        }),
                      });
                      const data = await resp.json();
                      if (data.error) throw new Error(data.error);
                      setNotif({ type: 'success', message: 'File deleted!' });
                      setConfirmDelete(false);
                      setSelectedFile(null);
                      setFileContent(null);
                      setEditContent('');
                      fetchFiles();
                    } catch (err: any) {
                      setNotif({ type: 'error', message: 'Failed to delete file.' });
                    } finally {
                      setLoading(false);
                    }
                  }}>Delete</Button>
                  <Button variant="outlined" size="small" onClick={() => setConfirmDelete(false)}>Cancel</Button>
                </Box>
              </Box>
            </Box>
          )}

          {/* Notifications */}
          {notif && (
            <Alert severity={notif.type} sx={{ mt: 2 }} onClose={() => setNotif(null)}>
              {notif.message}
            </Alert>
          )}

          <Button variant="outlined" color="error" onClick={logout} sx={{ mt: 3 }}>
            Logout
          </Button>
        </Box>
      ) : (
        <Box my={4}>
          <Typography variant="body1" paragraph>
            Welcome! This is the admin interface for managing JSON update files.
            Please login with GitHub to continue.
          </Typography>
          
          <Button 
            variant="contained" 
            color="primary" 
            startIcon={<GitHubIcon />} 
            onClick={loginWithGitHub}
            disabled={loading}
          >
            Login with GitHub
          </Button>
        </Box>
      )}
    </Container>
  );
};

export default App;
