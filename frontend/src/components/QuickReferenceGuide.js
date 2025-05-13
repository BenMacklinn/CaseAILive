import React, { useState } from 'react';
import {
  Drawer,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Typography,
  Box,
  IconButton,
  Divider,
  Collapse,
  Paper
} from '@mui/material';
import {
  MenuBook as MenuBookIcon,
  ExpandLess as ExpandLessIcon,
  ExpandMore as ExpandMoreIcon,
  Close as CloseIcon,
  Business as BusinessIcon,
  Calculate as CalculateIcon,
  Lightbulb as LightbulbIcon,
  TrendingUp as TrendingUpIcon
} from '@mui/icons-material';
import { caseGuide } from '../utils/caseGuide';

function QuickReferenceGuide({ open, onClose }) {
  const [expandedSections, setExpandedSections] = useState([]);
  const [expandedSubsections, setExpandedSubsections] = useState([]);

  const handleSectionClick = (section) => {
    setExpandedSections(prev =>
      prev.includes(section)
        ? prev.filter(s => s !== section)
        : [...prev, section]
    );
  };

  const handleSubsectionClick = (parentTitle, subsectionKey) => {
    const uniqueKey = `${parentTitle}_${subsectionKey}`;
    setExpandedSubsections(prev =>
      prev.includes(uniqueKey)
        ? prev.filter(s => s !== uniqueKey)
        : [...prev, uniqueKey]
    );
  };

  const renderSection = (title, icon, content) => (
    <Box>
      <ListItem component="div" onClick={() => handleSectionClick(title)} sx={{
        cursor: 'pointer',
        borderRadius: 3,
        mb: 1,
        background: expandedSections.includes(title) ? 'linear-gradient(90deg, #5FE6EC 0%, #8B38FF 100%)' : '#fff',
        color: expandedSections.includes(title) ? '#fff' : '#222',
        boxShadow: expandedSections.includes(title) ? '0 2px 12px rgba(44,62,80,0.10)' : 'none',
        fontWeight: 700,
        border: '1.5px solid #000',
        transition: 'all 0.2s',
        '&:hover': {
          background: 'linear-gradient(90deg, #5FE6EC 0%, #8B38FF 100%)',
          color: '#fff',
          boxShadow: '0 2px 12px rgba(44,62,80,0.10)'
        }
      }}>
        <ListItemIcon>{icon}</ListItemIcon>
        <ListItemText primary={
          title.trim().startsWith('<') ? (
            <span dangerouslySetInnerHTML={{ __html: title }} />
          ) : (
            title
          )
        } />
        {expandedSections.includes(title) ? <ExpandLessIcon /> : <ExpandMoreIcon />}
      </ListItem>
      <Collapse in={expandedSections.includes(title)} timeout="auto" unmountOnExit>
        <List component="div" disablePadding>
          {Object.entries(content).map(([key, value]) => (
            <Box key={key}>
              <ListItem component="div" onClick={() => handleSubsectionClick(title, key)} sx={{
                cursor: 'pointer',
                borderRadius: 2,
                mb: 0.5,
                background: expandedSubsections.includes(`${title}_${key}`)
                  ? 'linear-gradient(90deg, #e0e7ff 0%, #f8fafc 100%)'
                  : '#f3f4f6',
                color: expandedSubsections.includes(`${title}_${key}`) ? '#4B1A6B' : '#222',
                fontWeight: 600,
                border: '1.5px solid #000',
                transition: 'all 0.2s',
                '&:hover': {
                  background: 'linear-gradient(90deg, #e0e7ff 0%, #f8fafc 100%)',
                  color: '#4B1A6B',
                }
              }}>
                <ListItemText primary={
                  value.title.trim().startsWith('<') ? (
                    <span dangerouslySetInnerHTML={{ __html: value.title }} />
                  ) : (
                    value.title
                  )
                } />
                {expandedSubsections.includes(`${title}_${key}`) ? <ExpandLessIcon /> : <ExpandMoreIcon />}
              </ListItem>
              <Collapse in={expandedSubsections.includes(`${title}_${key}`)} timeout="auto" unmountOnExit>
                <Box sx={{
                  pl: 4, pr: 2, py: 2,
                  bgcolor: '#d1d5db',
                  borderRadius: 3,
                  border: '1.5px solid #000',
                  boxShadow: '0 1px 6px rgba(44,62,80,0.06)',
                  mb: 1
                }}>
                  {value.description && (
                    value.description.trim().startsWith('<') ? (
                      <span dangerouslySetInnerHTML={{ __html: value.description }} />
                    ) : (
                      value.description
                    )
                  )}
                  {value.structure && (
                    <List sx={{ maxHeight: 320, overflowY: 'auto' }}>
                      {value.structure.map((item, index) => (
                        typeof item === 'string' && item.trim().startsWith('<') ? (
                          <ListItem key={index} component="div" sx={{ py: 0.5 }}>
                            <span dangerouslySetInnerHTML={{ __html: item }} style={{ width: '100%' }} />
                          </ListItem>
                        ) : (
                        <ListItem key={index} component="div" sx={{ py: 0.5 }}>
                          <ListItemText primary={item} />
                        </ListItem>
                        )
                      ))}
                    </List>
                  )}
                  {value.items && (
                    <List sx={{ maxHeight: 320, overflowY: 'auto' }}>
                      {value.items.map((item, index) => (
                        typeof item === 'string' && item.trim().startsWith('<') ? (
                          <ListItem key={index} component="div" sx={{ py: 0.5 }}>
                            <span dangerouslySetInnerHTML={{ __html: item }} style={{ width: '100%' }} />
                          </ListItem>
                        ) : (
                        <ListItem key={index} component="div" sx={{ py: 0.5 }}>
                          <ListItemText primary={item} />
                        </ListItem>
                        )
                      ))}
                    </List>
                  )}
                  {value.keyMetrics && (
                    <Box sx={{ mt: 1 }}>
                      {!(typeof value.keyMetrics[0] === 'string' && value.keyMetrics[0].trim().startsWith('<')) && (
                      <Typography variant="subtitle2" sx={{ fontWeight: 'bold' }}>
                        Key Metrics:
                      </Typography>
                      )}
                      <List sx={{ maxHeight: 320, overflowY: 'auto' }}>
                        {value.keyMetrics.map((item, index) =>
                          typeof item === 'string' && item.trim().startsWith('<') ? (
                            <ListItem key={index} component="div" sx={{ py: 0.5 }}>
                              <span dangerouslySetInnerHTML={{ __html: item }} style={{ width: '100%' }} />
                            </ListItem>
                          ) : (
                          <ListItem key={index} component="div" sx={{ py: 0.5 }}>
                              <ListItemText primary={item} />
                          </ListItem>
                          )
                        )}
                      </List>
                    </Box>
                  )}
                  {value.trends && (
                    <Box sx={{ mt: 1 }}>
                      {!(typeof value.trends[0] === 'string' && value.trends[0].trim().startsWith('<')) && (
                      <Typography variant="subtitle2" sx={{ fontWeight: 'bold' }}>
                        Current Trends:
                      </Typography>
                      )}
                      <List sx={{ maxHeight: 320, overflowY: 'auto' }}>
                        {value.trends.map((item, index) =>
                          typeof item === 'string' && item.trim().startsWith('<') ? (
                            <ListItem key={index} component="div" sx={{ py: 0.5 }}>
                              <span dangerouslySetInnerHTML={{ __html: item }} style={{ width: '100%' }} />
                            </ListItem>
                          ) : (
                          <ListItem key={index} component="div" sx={{ py: 0.5 }}>
                              <ListItemText primary={item} />
                          </ListItem>
                          )
                        )}
                      </List>
                    </Box>
                  )}
                </Box>
              </Collapse>
            </Box>
          ))}
        </List>
      </Collapse>
    </Box>
  );

  return (
    <Drawer
      anchor="right"
      open={open}
      onClose={() => {
        if (document.activeElement) document.activeElement.blur();
        if (onClose) onClose();
      }}
      PaperProps={{
        sx: {
          width: 400,
          maxWidth: '90vw',
          bgcolor: 'linear-gradient(135deg, #f8fafc 60%, #e0e7ff 100%)',
          borderTopLeftRadius: 32,
          borderBottomLeftRadius: 32,
          boxShadow: '0 8px 32px rgba(44,62,80,0.12)',
          border: 'none',
          overflow: 'hidden',
        }
      }}
    >
      <Box sx={{
        p: 3,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        borderBottom: '1.5px solid #e0e7ff',
        background: 'linear-gradient(90deg, #5FE6EC 0%, #8B38FF 100%)',
        borderTopLeftRadius: 32,
        borderTopRightRadius: 0,
        boxShadow: '0 2px 12px rgba(44,62,80,0.06)',
        mb: 1
      }}>
        <Typography variant="h5" sx={{ display: 'flex', alignItems: 'center', gap: 1, fontWeight: 800, color: '#fff', letterSpacing: 1 }}>
          <MenuBookIcon sx={{ fontSize: 32, color: '#fff' }} /> Quick Reference Guide
        </Typography>
        <IconButton onClick={onClose} sx={{ color: '#fff', bgcolor: 'rgba(0,0,0,0.08)', '&:hover': { bgcolor: 'rgba(0,0,0,0.18)' } }}>
          <CloseIcon />
        </IconButton>
      </Box>
      <Divider sx={{ mb: 1, borderColor: '#e0e7ff' }} />
      <Box sx={{ px: 1, flex: 1, overflowY: 'auto', minHeight: 0 }}>
        <List sx={{ px: 1 }}>
          {renderSection('Frameworks', <BusinessIcon sx={{ color: '#5FE6EC' }} />, caseGuide.frameworks)}
          {renderSection('Formulas', <CalculateIcon sx={{ color: '#8B38FF' }} />, caseGuide.formulas)}
          {renderSection('Tips', <LightbulbIcon sx={{ color: '#FACC15' }} />, caseGuide.tips)}
          {renderSection('Industries', <TrendingUpIcon sx={{ color: '#4B1A6B' }} />, caseGuide.industries)}
      </List>
      </Box>
    </Drawer>
  );
}

export default QuickReferenceGuide; 