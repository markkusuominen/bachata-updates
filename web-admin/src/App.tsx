import React from 'react';
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';

const App: React.FC = () => (
  <Container maxWidth="md">
    <Typography variant="h3" component="h1" gutterBottom>
      Bachata Updates Admin
    </Typography>
    <Typography variant="body1">
      Welcome! This is the admin interface for managing JSON update files. Authentication and editing features coming soon.
    </Typography>
  </Container>
);

export default App;
