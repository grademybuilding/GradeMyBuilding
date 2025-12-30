import { format } from "date-fns";
import type { InspectionDetails, ChecklistItem, InspectionPhoto } from "@/hooks/useInspections";

interface InspectionReportPDFProps {
  inspection: InspectionDetails;
  checklistItems: ChecklistItem[];
  photos: InspectionPhoto[];
}

/**
 * PDF-optimized version of the Inspection Report
 * Uses inline styles for consistent rendering with html2canvas
 */
export default function InspectionReportPDF({ inspection, checklistItems, photos }: InspectionReportPDFProps) {
  // Compute display values with fallback logic
  const checklistData = inspection.checklist_data as Record<string, unknown> | null;
  const props = inspection.properties;
  
  const hasRealPropertyData = props?.address && 
    props.address !== 'Draft Property' && 
    props.city !== 'Unknown';

  const displayAddress = hasRealPropertyData 
    ? props?.address 
    : (checklistData?.address as string) || 'Unknown Address';
  const displayCity = hasRealPropertyData 
    ? props?.city 
    : (checklistData?.city as string) || '';
  const displayState = hasRealPropertyData 
    ? props?.state 
    : (checklistData?.state as string) || '';
  const displayZipCode = hasRealPropertyData 
    ? props?.zip_code 
    : (checklistData?.zipCode as string) || '';
  const displayPropertyType = hasRealPropertyData 
    ? props?.property_type 
    : (checklistData?.propertyType as string) || 'Unknown';
  const displayYearBuilt = hasRealPropertyData 
    ? props?.year_built 
    : (checklistData?.yearBuilt as number) || null;
  const displaySquareFootage = hasRealPropertyData 
    ? props?.square_footage 
    : (checklistData?.squareFootage as number) || null;

  const getGradeStyles = (grade: string | null): React.CSSProperties => {
    if (!grade) return { backgroundColor: '#9ca3af', color: '#ffffff' };
    const baseGrade = grade.charAt(0);
    switch (baseGrade) {
      case 'A': return { backgroundColor: '#10b981', color: '#ffffff' };
      case 'B': return { backgroundColor: '#3b82f6', color: '#ffffff' };
      case 'C': return { backgroundColor: '#eab308', color: '#ffffff' };
      case 'D': return { backgroundColor: '#f97316', color: '#ffffff' };
      case 'F': return { backgroundColor: '#ef4444', color: '#ffffff' };
      default: return { backgroundColor: '#9ca3af', color: '#ffffff' };
    }
  };

  const getRatingStyles = (rating: string): React.CSSProperties => {
    switch (rating) {
      case 'Excellent': return { color: '#059669' };
      case 'Very Good': return { color: '#2563eb' };
      case 'Good': return { color: '#ca8a04' };
      case 'Poor': return { color: '#ea580c' };
      case 'Replace': return { color: '#dc2626' };
      default: return { color: '#6b7280' };
    }
  };

  // Group checklist items by category
  const groupedItems = checklistItems.reduce((acc, item) => {
    const category = item.category || 'Other';
    if (!acc[category]) acc[category] = [];
    acc[category].push(item);
    return acc;
  }, {} as Record<string, ChecklistItem[]>);

  // Common styles
  const cardStyle: React.CSSProperties = {
    border: '1px solid #e5e7eb',
    borderRadius: '8px',
    backgroundColor: '#ffffff',
    marginBottom: '16px',
  };

  const cardHeaderStyle: React.CSSProperties = {
    padding: '16px 16px 8px 16px',
  };

  const cardTitleStyle: React.CSSProperties = {
    fontSize: '14px',
    fontWeight: 600,
    color: '#111827',
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
  };

  const cardContentStyle: React.CSSProperties = {
    padding: '0 16px 16px 16px',
  };

  const mutedTextStyle: React.CSSProperties = {
    color: '#6b7280',
    fontSize: '14px',
  };

  const separatorStyle: React.CSSProperties = {
    height: '1px',
    backgroundColor: '#e5e7eb',
    margin: '8px 0',
  };

  return (
    <div style={{ fontFamily: 'system-ui, -apple-system, sans-serif', backgroundColor: '#ffffff', color: '#111827', padding: '24px' }}>
      {/* Report Header */}
      <div style={{ textAlign: 'center', borderBottom: '1px solid #e5e7eb', paddingBottom: '24px', marginBottom: '24px' }}>
        <h1 style={{ fontSize: '24px', fontWeight: 'bold', color: '#111827', margin: 0 }}>Building Inspection Report</h1>
        <p style={{ ...mutedTextStyle, marginTop: '8px' }}>
          Generated on {format(new Date(), 'MMMM d, yyyy')}
        </p>
      </div>

      {/* Property & Grade Summary */}
      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '16px', marginBottom: '16px' }}>
        {/* Property Information */}
        <div style={cardStyle}>
          <div style={cardHeaderStyle}>
            <div style={cardTitleStyle}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M3 21h18M9 8h1M9 12h1M9 16h1M14 8h1M14 12h1M14 16h1M5 21V5a2 2 0 012-2h10a2 2 0 012 2v16"/>
              </svg>
              Property Information
            </div>
          </div>
          <div style={cardContentStyle}>
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '8px' }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#6b7280" strokeWidth="2" style={{ marginTop: '2px' }}>
                <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z"/>
                <circle cx="12" cy="10" r="3"/>
              </svg>
              <div>
                <p style={{ fontWeight: 500, margin: 0 }}>{displayAddress}</p>
                <p style={{ ...mutedTextStyle, margin: 0 }}>
                  {displayCity}{displayState ? `, ${displayState}` : ''} {displayZipCode}
                </p>
              </div>
            </div>
            <div style={separatorStyle} />
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              <div>
                <span style={mutedTextStyle}>Property Type:</span>
                <span style={{ marginLeft: '8px', fontWeight: 500, textTransform: 'capitalize' }}>{displayPropertyType}</span>
              </div>
              {displayYearBuilt && (
                <div>
                  <span style={mutedTextStyle}>Year Built:</span>
                  <span style={{ marginLeft: '8px', fontWeight: 500 }}>{displayYearBuilt}</span>
                </div>
              )}
              {displaySquareFootage && (
                <div>
                  <span style={mutedTextStyle}>Size:</span>
                  <span style={{ marginLeft: '8px', fontWeight: 500 }}>{Number(displaySquareFootage).toLocaleString()} sq ft</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Overall Grade */}
        <div style={cardStyle}>
          <div style={{ ...cardHeaderStyle, textAlign: 'center' }}>
            <div style={{ ...cardTitleStyle, justifyContent: 'center' }}>Overall Grade</div>
          </div>
          <div style={{ ...cardContentStyle, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
            <div style={{
              width: '80px',
              height: '80px',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '32px',
              fontWeight: 'bold',
              ...getGradeStyles(inspection.final_grade_letter)
            }}>
              {inspection.final_grade_letter || 'N/A'}
            </div>
            {inspection.final_grade_numeric !== null && (
              <p style={{ fontSize: '18px', fontWeight: 600, marginTop: '12px' }}>{inspection.final_grade_numeric.toFixed(1)}%</p>
            )}
          </div>
        </div>
      </div>

      {/* Inspection Details & Inspector Info */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
        {/* Inspection Details */}
        <div style={cardStyle}>
          <div style={cardHeaderStyle}>
            <div style={cardTitleStyle}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
                <line x1="16" y1="2" x2="16" y2="6"/>
                <line x1="8" y1="2" x2="8" y2="6"/>
                <line x1="3" y1="10" x2="21" y2="10"/>
              </svg>
              Inspection Details
            </div>
          </div>
          <div style={{ ...cardContentStyle, fontSize: '14px' }}>
            <div style={{ marginBottom: '8px' }}>
              <span style={mutedTextStyle}>Date:</span>
              <span style={{ marginLeft: '8px', fontWeight: 500 }}>{format(new Date(inspection.inspection_date), 'MMMM d, yyyy')}</span>
            </div>
            {inspection.inspection_time && (
              <div style={{ marginBottom: '8px' }}>
                <span style={mutedTextStyle}>Time:</span>
                <span style={{ marginLeft: '8px', fontWeight: 500 }}>{inspection.inspection_time}</span>
              </div>
            )}
            <div style={{ marginBottom: '8px' }}>
              <span style={mutedTextStyle}>Status:</span>
              <span style={{ 
                marginLeft: '8px', 
                padding: '2px 8px', 
                borderRadius: '4px', 
                border: '1px solid #e5e7eb',
                fontSize: '12px',
                textTransform: 'capitalize'
              }}>{inspection.status}</span>
            </div>
            {inspection.weather_conditions && inspection.weather_conditions.length > 0 && (
              <div style={{ marginBottom: '8px' }}>
                <span style={mutedTextStyle}>Weather:</span>
                <span style={{ marginLeft: '8px', fontWeight: 500 }}>{inspection.weather_conditions.join(', ')}</span>
              </div>
            )}
            {inspection.temperature !== null && (
              <div>
                <span style={mutedTextStyle}>Temperature:</span>
                <span style={{ marginLeft: '8px', fontWeight: 500 }}>{inspection.temperature}°F</span>
              </div>
            )}
          </div>
        </div>

        {/* Inspector Information */}
        {inspection.profiles && (
          <div style={cardStyle}>
            <div style={cardHeaderStyle}>
              <div style={cardTitleStyle}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/>
                  <circle cx="12" cy="7" r="4"/>
                </svg>
                Inspector Information
              </div>
            </div>
            <div style={{ ...cardContentStyle, fontSize: '14px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#6b7280" strokeWidth="2">
                  <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/>
                  <circle cx="12" cy="7" r="4"/>
                </svg>
                <span style={{ fontWeight: 500 }}>{inspection.profiles.full_name}</span>
              </div>
              {inspection.profiles.company_name && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#6b7280" strokeWidth="2">
                    <rect x="2" y="7" width="20" height="14" rx="2" ry="2"/>
                    <path d="M16 21V5a2 2 0 00-2-2h-4a2 2 0 00-2 2v16"/>
                  </svg>
                  <span>{inspection.profiles.company_name}</span>
                </div>
              )}
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#6b7280" strokeWidth="2">
                  <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
                  <polyline points="22,6 12,13 2,6"/>
                </svg>
                <span>{inspection.profiles.email}</span>
              </div>
              {inspection.profiles.phone && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#6b7280" strokeWidth="2">
                    <path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07 19.5 19.5 0 01-6-6 19.79 19.79 0 01-3.07-8.67A2 2 0 014.11 2h3a2 2 0 012 1.72 12.84 12.84 0 00.7 2.81 2 2 0 01-.45 2.11L8.09 9.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45 12.84 12.84 0 002.81.7A2 2 0 0122 16.92z"/>
                  </svg>
                  <span>{inspection.profiles.phone}</span>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Rating Breakdown */}
      {inspection.total_items_rated && inspection.total_items_rated > 0 && (
        <div style={cardStyle}>
          <div style={cardHeaderStyle}>
            <div style={cardTitleStyle}>Rating Breakdown</div>
          </div>
          <div style={cardContentStyle}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '16px', textAlign: 'center' }}>
              <div>
                <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#059669' }}>{inspection.excellent_count || 0}</div>
                <div style={{ fontSize: '12px', color: '#6b7280' }}>Excellent</div>
              </div>
              <div>
                <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#2563eb' }}>{inspection.very_good_count || 0}</div>
                <div style={{ fontSize: '12px', color: '#6b7280' }}>Very Good</div>
              </div>
              <div>
                <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#ca8a04' }}>{inspection.good_count || 0}</div>
                <div style={{ fontSize: '12px', color: '#6b7280' }}>Good</div>
              </div>
              <div>
                <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#ea580c' }}>{inspection.poor_count || 0}</div>
                <div style={{ fontSize: '12px', color: '#6b7280' }}>Poor</div>
              </div>
              <div>
                <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#dc2626' }}>{inspection.replace_count || 0}</div>
                <div style={{ fontSize: '12px', color: '#6b7280' }}>Replace</div>
              </div>
            </div>
            <div style={{ marginTop: '16px', textAlign: 'center', fontSize: '14px', color: '#6b7280' }}>
              Total Items Rated: {inspection.total_items_rated}
            </div>
          </div>
        </div>
      )}

      {/* Category Grades */}
      {inspection.category_scores && Object.keys(inspection.category_scores as Record<string, unknown>).length > 0 && (
        <div style={cardStyle}>
          <div style={cardHeaderStyle}>
            <div style={cardTitleStyle}>Category Grades</div>
          </div>
          <div style={cardContentStyle}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '12px' }}>
              {Object.entries(inspection.category_scores as Record<string, { score?: number; grade?: string }>)
                .sort(([, a], [, b]) => (b.score ?? 0) - (a.score ?? 0))
                .map(([category, data]) => {
                  const score = data.score ?? 0;
                  const derivedGrade = data.grade || (
                    score >= 95 ? 'A+' :
                    score >= 90 ? 'A' :
                    score >= 85 ? 'A-' :
                    score >= 80 ? 'B+' :
                    score >= 75 ? 'B' :
                    score >= 70 ? 'B-' :
                    score >= 65 ? 'C+' :
                    score >= 60 ? 'C' :
                    score >= 55 ? 'C-' :
                    score >= 45 ? 'D' : 'F'
                  );
                  return (
                    <div 
                      key={category} 
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: '12px',
                        border: '1px solid #e5e7eb',
                        borderRadius: '8px',
                      }}
                    >
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <p style={{ fontSize: '14px', fontWeight: 500, margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{category}</p>
                        <p style={{ fontSize: '12px', color: '#6b7280', margin: 0 }}>{score.toFixed(0)}%</p>
                      </div>
                      <span style={{
                        marginLeft: '8px',
                        padding: '4px 8px',
                        borderRadius: '4px',
                        fontSize: '12px',
                        fontWeight: 500,
                        ...getGradeStyles(derivedGrade.charAt(0))
                      }}>
                        {derivedGrade}
                      </span>
                    </div>
                  );
                })}
            </div>
          </div>
        </div>
      )}

      {/* Checklist Items by Category */}
      {Object.keys(groupedItems).length > 0 && (
        <div style={cardStyle}>
          <div style={cardHeaderStyle}>
            <div style={cardTitleStyle}>Detailed Checklist</div>
          </div>
          <div style={cardContentStyle}>
            {Object.entries(groupedItems).map(([category, items]) => (
              <div key={category} style={{ marginBottom: '16px' }}>
                <h4 style={{ fontWeight: 500, fontSize: '14px', marginBottom: '8px', color: '#3b82f6' }}>{category}</h4>
                <div style={{ paddingLeft: '16px', borderLeft: '2px solid rgba(59, 130, 246, 0.2)' }}>
                  {items.map((item) => (
                    <div key={item.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '4px 0', fontSize: '14px' }}>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <span>{item.item_name}</span>
                        {item.notes && (
                          <p style={{ fontSize: '12px', color: '#6b7280', marginTop: '2px' }}>{item.notes}</p>
                        )}
                      </div>
                      {item.rating && (
                        <span style={{ fontSize: '12px', fontWeight: 500, marginLeft: '8px', ...getRatingStyles(item.rating) }}>
                          {item.rating}
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Photos */}
      {photos.length > 0 && (
        <div style={{ ...cardStyle, pageBreakBefore: 'always' }}>
          <div style={cardHeaderStyle}>
            <div style={cardTitleStyle}>Inspection Photos ({photos.length})</div>
          </div>
          <div style={cardContentStyle}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '12px' }}>
              {photos.map((photo) => (
                <div key={photo.id}>
                  <div style={{ 
                    aspectRatio: '1', 
                    backgroundColor: '#f3f4f6', 
                    borderRadius: '8px', 
                    overflow: 'hidden',
                    border: '1px solid #e5e7eb'
                  }}>
                    <img 
                      src={photo.photo_url} 
                      alt={photo.caption || 'Inspection photo'} 
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                      crossOrigin="anonymous"
                    />
                  </div>
                  {(photo.caption || photo.category) && (
                    <p style={{ fontSize: '12px', color: '#6b7280', marginTop: '4px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {photo.caption || photo.category}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Notes */}
      {inspection.notes && (
        <div style={cardStyle}>
          <div style={cardHeaderStyle}>
            <div style={cardTitleStyle}>Inspector Notes</div>
          </div>
          <div style={cardContentStyle}>
            <p style={{ fontSize: '14px', color: '#6b7280', whiteSpace: 'pre-wrap', margin: 0 }}>
              {inspection.notes}
            </p>
          </div>
        </div>
      )}

      {/* Footer */}
      <div style={{ textAlign: 'center', fontSize: '12px', color: '#6b7280', paddingTop: '16px', borderTop: '1px solid #e5e7eb', marginTop: '24px' }}>
        <p style={{ margin: 0 }}>This report was generated by GradeMyBuilding</p>
        <p style={{ margin: '4px 0 0 0' }}>© {new Date().getFullYear()} GradeMyBuilding. All rights reserved.</p>
      </div>
    </div>
  );
}
