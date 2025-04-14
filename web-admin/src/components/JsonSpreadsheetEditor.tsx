import React, { useState } from 'react';
import { DataGrid, GridRowsProp, GridColDef, GridRowModel } from '@mui/x-data-grid';
import { Box, Button, Typography, Alert } from '@mui/material';

/**
 * Props for JsonSpreadsheetEditor
 */
interface JsonSpreadsheetEditorProps {
  /** The JSON data as an array of objects */
  data: any[];
  /** Callback to save the edited data */
  onSave: (newData: any[]) => Promise<void>;
  /** Loading state */
  loading?: boolean;
  /** Error message (if any) */
  error?: string | null;
}

/**
 * JsonSpreadsheetEditor
 * Displays and edits JSON data in a spreadsheet (table) format.
 * Allows direct cell editing and saving changes.
 */
const JsonSpreadsheetEditor: React.FC<JsonSpreadsheetEditorProps> = ({ data, onSave, loading = false, error = null }) => {
  // Local state for edits
  const [rows, setRows] = useState<GridRowsProp>(data.map((row, idx) => ({ id: idx, ...row })));
  const [notif, setNotif] = useState<string | null>(null);
  
  // Determine columns dynamically from data
  const columns: GridColDef[] = data.length > 0
    ? Object.keys(data[0]).map((key) => ({
        field: key,
        headerName: key,
        flex: 1,
        editable: true,
      }))
    : [];

  // Handle cell edit
  const handleRowEdit = (newRow: GridRowModel, oldRow: GridRowModel) => {
    const updatedRows = rows.map((row) => (row.id === newRow.id ? newRow : row));
    setRows(updatedRows);
    return newRow;
  };

  // Handle save
  const handleSave = async () => {
    setNotif(null);
    try {
      // Remove 'id' field before saving
      const cleanRows = rows.map(({ id, ...rest }) => rest);
      await onSave(cleanRows);
      setNotif('Saved successfully!');
    } catch (e) {
      setNotif('Failed to save.');
    }
  };

  return (
    <Box>
      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
      <Typography variant="subtitle1" gutterBottom>Spreadsheet Editor</Typography>
      <Box sx={{ height: 400, width: '100%', mb: 2 }}>
        <DataGrid
          rows={rows}
          columns={columns}
          disableRowSelectionOnClick
          processRowUpdate={handleRowEdit}
          experimentalFeatures={{ newEditingApi: true }}
          loading={loading}
        />
      </Box>
      <Button variant="contained" color="primary" onClick={handleSave} disabled={loading}>
        Save
      </Button>
      {notif && <Alert severity="success" sx={{ mt: 2 }} onClose={() => setNotif(null)}>{notif}</Alert>}
    </Box>
  );
};

export default JsonSpreadsheetEditor;
