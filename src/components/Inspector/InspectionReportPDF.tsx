import { Document, Page, Text, View, StyleSheet, Image } from "@react-pdf/renderer";
import { format } from "date-fns";
import type { InspectionDetails, ChecklistItem, InspectionPhoto } from "@/hooks/useInspections";

interface InspectionReportPDFProps {
  inspection: InspectionDetails;
  checklistItems: ChecklistItem[];
  photos: InspectionPhoto[];
}

// Create styles
const styles = StyleSheet.create({
  page: {
    padding: 40,
    paddingBottom: 60,
    fontSize: 10,
    fontFamily: "Helvetica",
    backgroundColor: "#ffffff",
  },
  header: {
    textAlign: "center",
    borderBottom: "1px solid #e5e7eb",
    paddingBottom: 16,
    marginBottom: 16,
  },
  title: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#111827",
  },
  subtitle: {
    fontSize: 9,
    color: "#6b7280",
    marginTop: 4,
  },
  row: {
    flexDirection: "row",
    gap: 10,
    marginBottom: 10,
  },
  card: {
    border: "1px solid #e5e7eb",
    borderRadius: 6,
    backgroundColor: "#ffffff",
    marginBottom: 10,
  },
  cardHeader: {
    padding: 10,
    paddingBottom: 6,
    borderBottom: "1px solid #f3f4f6",
  },
  cardTitle: {
    fontSize: 10,
    fontWeight: "bold",
    color: "#111827",
  },
  cardContent: {
    padding: 10,
  },
  label: {
    fontSize: 8,
    color: "#6b7280",
  },
  value: {
    fontSize: 9,
    fontWeight: "medium",
    color: "#111827",
  },
  mutedText: {
    fontSize: 8,
    color: "#6b7280",
  },
  flexRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 4,
  },
  gradeCircle: {
    width: 50,
    height: 50,
    borderRadius: 25,
    alignItems: "center",
    justifyContent: "center",
    alignSelf: "center",
  },
  gradeText: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#ffffff",
  },
  gradePercent: {
    fontSize: 12,
    fontWeight: "bold",
    textAlign: "center",
    marginTop: 6,
  },
  separator: {
    height: 1,
    backgroundColor: "#e5e7eb",
    marginVertical: 6,
  },
  ratingGrid: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  ratingItem: {
    alignItems: "center",
    flex: 1,
  },
  ratingNumber: {
    fontSize: 16,
    fontWeight: "bold",
  },
  ratingLabel: {
    fontSize: 7,
    color: "#6b7280",
    marginTop: 2,
  },
  categoryGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 6,
  },
  categoryItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 8,
    border: "1px solid #e5e7eb",
    borderRadius: 4,
    width: "48%",
  },
  categoryName: {
    fontSize: 9,
    fontWeight: "medium",
  },
  categoryScore: {
    fontSize: 7,
    color: "#6b7280",
  },
  gradeBadge: {
    paddingHorizontal: 5,
    paddingVertical: 2,
    borderRadius: 3,
    fontSize: 8,
    fontWeight: "bold",
    color: "#ffffff",
  },
  checklistCategory: {
    marginBottom: 10,
  },
  checklistCategoryTitle: {
    fontSize: 10,
    fontWeight: "bold",
    color: "#3b82f6",
    marginBottom: 4,
  },
  checklistItems: {
    paddingLeft: 10,
    borderLeft: "2px solid rgba(59, 130, 246, 0.3)",
  },
  checklistItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    paddingVertical: 3,
  },
  checklistItemName: {
    fontSize: 9,
    flex: 1,
    paddingRight: 6,
  },
  checklistItemNotes: {
    fontSize: 7,
    color: "#6b7280",
    marginTop: 1,
  },
  photoGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  photoItem: {
    width: "31%",
    marginBottom: 6,
  },
  photo: {
    width: "100%",
    height: 100,
    objectFit: "cover",
    borderRadius: 4,
    border: "1px solid #e5e7eb",
  },
  photoCaption: {
    fontSize: 7,
    color: "#6b7280",
    marginTop: 2,
  },
  footer: {
    position: "absolute",
    bottom: 20,
    left: 40,
    right: 40,
    textAlign: "center",
    fontSize: 8,
    color: "#9ca3af",
    borderTop: "1px solid #e5e7eb",
    paddingTop: 10,
  },
  pageNumber: {
    position: "absolute",
    bottom: 20,
    right: 40,
    fontSize: 8,
    color: "#9ca3af",
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: "bold",
    color: "#111827",
    marginBottom: 10,
    paddingBottom: 6,
    borderBottom: "1px solid #e5e7eb",
  },
  col2: {
    flex: 2,
  },
  col1: {
    flex: 1,
  },
});

const getGradeColor = (grade: string | null): string => {
  if (!grade) return "#9ca3af";
  const baseGrade = grade.charAt(0);
  switch (baseGrade) {
    case "A": return "#10b981";
    case "B": return "#3b82f6";
    case "C": return "#eab308";
    case "D": return "#f97316";
    case "F": return "#ef4444";
    default: return "#9ca3af";
  }
};

const getRatingColor = (rating: string): string => {
  switch (rating) {
    case "Excellent": return "#059669";
    case "Very Good": return "#2563eb";
    case "Good": return "#ca8a04";
    case "Poor": return "#ea580c";
    case "Replace": return "#dc2626";
    default: return "#6b7280";
  }
};

// Page footer component
const PageFooter = () => (
  <Text 
    style={styles.pageNumber} 
    render={({ pageNumber, totalPages }) => `Page ${pageNumber} of ${totalPages}`} 
    fixed 
  />
);

export default function InspectionReportPDF({ inspection, checklistItems, photos }: InspectionReportPDFProps) {
  const checklistData = inspection.checklist_data as Record<string, unknown> | null;
  const props = inspection.properties;
  
  const hasRealPropertyData = props?.address && 
    props.address !== "Draft Property" && 
    props.city !== "Unknown";

  const displayAddress = hasRealPropertyData 
    ? props?.address 
    : (checklistData?.address as string) || "Unknown Address";
  const displayCity = hasRealPropertyData 
    ? props?.city 
    : (checklistData?.city as string) || "";
  const displayState = hasRealPropertyData 
    ? props?.state 
    : (checklistData?.state as string) || "";
  const displayZipCode = hasRealPropertyData 
    ? props?.zip_code 
    : (checklistData?.zipCode as string) || "";
  const displayPropertyType = hasRealPropertyData 
    ? props?.property_type 
    : (checklistData?.propertyType as string) || "Unknown";
  const displayYearBuilt = hasRealPropertyData 
    ? props?.year_built 
    : (checklistData?.yearBuilt as number) || null;
  const displaySquareFootage = hasRealPropertyData 
    ? props?.square_footage 
    : (checklistData?.squareFootage as number) || null;

  // Group checklist items by category
  const groupedItems = checklistItems.reduce((acc, item) => {
    const category = item.category || "Other";
    if (!acc[category]) acc[category] = [];
    acc[category].push(item);
    return acc;
  }, {} as Record<string, ChecklistItem[]>);

  const categoryScores = inspection.category_scores as Record<string, { score?: number; grade?: string }> | null;

  // Split photos into chunks for pagination (9 photos per page in 3x3 grid)
  const photosPerPage = 9;
  const photoChunks: InspectionPhoto[][] = [];
  for (let i = 0; i < photos.length; i += photosPerPage) {
    photoChunks.push(photos.slice(i, i + photosPerPage));
  }

  return (
    <Document>
      {/* Page 1: Summary */}
      <Page size="A4" style={styles.page} wrap>
        <PageFooter />
        
        {/* Header */}
        <View style={styles.header} fixed>
          <Text style={styles.title}>Building Inspection Report</Text>
          <Text style={styles.subtitle}>Generated on {format(new Date(), "MMMM d, yyyy")}</Text>
        </View>

        {/* Property & Grade Row */}
        <View style={styles.row}>
          {/* Property Information */}
          <View style={[styles.card, styles.col2]}>
            <View style={styles.cardHeader}>
              <Text style={styles.cardTitle}>Property Information</Text>
            </View>
            <View style={styles.cardContent}>
              <Text style={styles.value}>{displayAddress}</Text>
              <Text style={styles.mutedText}>
                {displayCity}{displayState ? `, ${displayState}` : ""} {displayZipCode}
              </Text>
              <View style={styles.separator} />
              <View style={styles.flexRow}>
                <Text style={styles.label}>Property Type: </Text>
                <Text style={styles.value}>{displayPropertyType}</Text>
              </View>
              {displayYearBuilt && (
                <View style={styles.flexRow}>
                  <Text style={styles.label}>Year Built: </Text>
                  <Text style={styles.value}>{displayYearBuilt}</Text>
                </View>
              )}
              {displaySquareFootage && (
                <View style={styles.flexRow}>
                  <Text style={styles.label}>Size: </Text>
                  <Text style={styles.value}>{Number(displaySquareFootage).toLocaleString()} sq ft</Text>
                </View>
              )}
            </View>
          </View>

          {/* Overall Grade */}
          <View style={[styles.card, styles.col1]}>
            <View style={styles.cardHeader}>
              <Text style={[styles.cardTitle, { textAlign: "center" }]}>Overall Grade</Text>
            </View>
            <View style={[styles.cardContent, { alignItems: "center" }]}>
              <View style={[styles.gradeCircle, { backgroundColor: getGradeColor(inspection.final_grade_letter) }]}>
                <Text style={styles.gradeText}>{inspection.final_grade_letter || "N/A"}</Text>
              </View>
              {inspection.final_grade_numeric !== null && (
                <Text style={styles.gradePercent}>{inspection.final_grade_numeric.toFixed(1)}%</Text>
              )}
            </View>
          </View>
        </View>

        {/* Inspection Details & Inspector Row */}
        <View style={styles.row}>
          {/* Inspection Details */}
          <View style={[styles.card, styles.col1]}>
            <View style={styles.cardHeader}>
              <Text style={styles.cardTitle}>Inspection Details</Text>
            </View>
            <View style={styles.cardContent}>
              <View style={styles.flexRow}>
                <Text style={styles.label}>Date: </Text>
                <Text style={styles.value}>{format(new Date(inspection.inspection_date), "MMMM d, yyyy")}</Text>
              </View>
              {inspection.inspection_time && (
                <View style={styles.flexRow}>
                  <Text style={styles.label}>Time: </Text>
                  <Text style={styles.value}>{inspection.inspection_time}</Text>
                </View>
              )}
              <View style={styles.flexRow}>
                <Text style={styles.label}>Status: </Text>
                <Text style={styles.value}>{inspection.status}</Text>
              </View>
              {inspection.weather_conditions && inspection.weather_conditions.length > 0 && (
                <View style={styles.flexRow}>
                  <Text style={styles.label}>Weather: </Text>
                  <Text style={styles.value}>{inspection.weather_conditions.join(", ")}</Text>
                </View>
              )}
              {inspection.temperature !== null && (
                <View style={styles.flexRow}>
                  <Text style={styles.label}>Temperature: </Text>
                  <Text style={styles.value}>{inspection.temperature}°F</Text>
                </View>
              )}
            </View>
          </View>

          {/* Inspector Information */}
          {inspection.profiles && (
            <View style={[styles.card, styles.col1]}>
              <View style={styles.cardHeader}>
                <Text style={styles.cardTitle}>Inspector Information</Text>
              </View>
              <View style={styles.cardContent}>
                <Text style={styles.value}>{inspection.profiles.full_name}</Text>
                {inspection.profiles.company_name && (
                  <Text style={styles.mutedText}>{inspection.profiles.company_name}</Text>
                )}
                <Text style={styles.mutedText}>{inspection.profiles.email}</Text>
                {inspection.profiles.phone && (
                  <Text style={styles.mutedText}>{inspection.profiles.phone}</Text>
                )}
              </View>
            </View>
          )}
        </View>

        {/* Rating Breakdown */}
        {inspection.total_items_rated && inspection.total_items_rated > 0 && (
          <View style={styles.card} wrap={false}>
            <View style={styles.cardHeader}>
              <Text style={styles.cardTitle}>Rating Breakdown</Text>
            </View>
            <View style={styles.cardContent}>
              <View style={styles.ratingGrid}>
                <View style={styles.ratingItem}>
                  <Text style={[styles.ratingNumber, { color: "#059669" }]}>{inspection.excellent_count || 0}</Text>
                  <Text style={styles.ratingLabel}>Excellent</Text>
                </View>
                <View style={styles.ratingItem}>
                  <Text style={[styles.ratingNumber, { color: "#2563eb" }]}>{inspection.very_good_count || 0}</Text>
                  <Text style={styles.ratingLabel}>Very Good</Text>
                </View>
                <View style={styles.ratingItem}>
                  <Text style={[styles.ratingNumber, { color: "#ca8a04" }]}>{inspection.good_count || 0}</Text>
                  <Text style={styles.ratingLabel}>Good</Text>
                </View>
                <View style={styles.ratingItem}>
                  <Text style={[styles.ratingNumber, { color: "#ea580c" }]}>{inspection.poor_count || 0}</Text>
                  <Text style={styles.ratingLabel}>Poor</Text>
                </View>
                <View style={styles.ratingItem}>
                  <Text style={[styles.ratingNumber, { color: "#dc2626" }]}>{inspection.replace_count || 0}</Text>
                  <Text style={styles.ratingLabel}>Replace</Text>
                </View>
              </View>
              <Text style={[styles.mutedText, { textAlign: "center", marginTop: 8 }]}>
                Total Items Rated: {inspection.total_items_rated}
              </Text>
            </View>
          </View>
        )}

        {/* Category Grades */}
        {categoryScores && Object.keys(categoryScores).length > 0 && (
          <View style={styles.card} wrap={false}>
            <View style={styles.cardHeader}>
              <Text style={styles.cardTitle}>Category Grades</Text>
            </View>
            <View style={styles.cardContent}>
              <View style={styles.categoryGrid}>
                {Object.entries(categoryScores)
                  .sort(([, a], [, b]) => (b.score ?? 0) - (a.score ?? 0))
                  .map(([category, data]) => {
                    const score = data.score ?? 0;
                    const derivedGrade = data.grade || (
                      score >= 95 ? "A+" :
                      score >= 90 ? "A" :
                      score >= 85 ? "A-" :
                      score >= 80 ? "B+" :
                      score >= 75 ? "B" :
                      score >= 70 ? "B-" :
                      score >= 65 ? "C+" :
                      score >= 60 ? "C" :
                      score >= 55 ? "C-" :
                      score >= 45 ? "D" : "F"
                    );
                    return (
                      <View key={category} style={styles.categoryItem}>
                        <View>
                          <Text style={styles.categoryName}>{category}</Text>
                          <Text style={styles.categoryScore}>{score.toFixed(0)}%</Text>
                        </View>
                        <Text style={[styles.gradeBadge, { backgroundColor: getGradeColor(derivedGrade.charAt(0)) }]}>
                          {derivedGrade}
                        </Text>
                      </View>
                    );
                  })}
              </View>
            </View>
          </View>
        )}

        {/* Notes (if exists and fits on first page) */}
        {inspection.notes && (
          <View style={styles.card} wrap={false}>
            <View style={styles.cardHeader}>
              <Text style={styles.cardTitle}>Inspector Notes</Text>
            </View>
            <View style={styles.cardContent}>
              <Text style={styles.mutedText}>{inspection.notes}</Text>
            </View>
          </View>
        )}
      </Page>

      {/* Checklist Page(s) */}
      {Object.keys(groupedItems).length > 0 && (
        <Page size="A4" style={styles.page} wrap>
          <PageFooter />
          
          <Text style={styles.sectionTitle}>Detailed Checklist</Text>
          
          {Object.entries(groupedItems).map(([category, items]) => (
            <View key={category} style={styles.checklistCategory} wrap={false}>
              <Text style={styles.checklistCategoryTitle}>{category}</Text>
              <View style={styles.checklistItems}>
                {items.map((item) => (
                  <View key={item.id} style={styles.checklistItem}>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.checklistItemName}>{item.item_name}</Text>
                      {item.notes && (
                        <Text style={styles.checklistItemNotes}>{item.notes}</Text>
                      )}
                    </View>
                    {item.rating && (
                      <Text style={{ fontSize: 8, fontWeight: "bold", color: getRatingColor(item.rating) }}>
                        {item.rating}
                      </Text>
                    )}
                  </View>
                ))}
              </View>
            </View>
          ))}
        </Page>
      )}

      {/* Photos Page(s) */}
      {photoChunks.map((chunk, pageIndex) => (
        <Page key={`photos-${pageIndex}`} size="A4" style={styles.page}>
          <PageFooter />
          
          <Text style={styles.sectionTitle}>
            Inspection Photos {photoChunks.length > 1 ? `(${pageIndex + 1}/${photoChunks.length})` : `(${photos.length})`}
          </Text>
          
          <View style={styles.photoGrid}>
            {chunk.map((photo) => (
              <View key={photo.id} style={styles.photoItem}>
                <Image src={photo.photo_url} style={styles.photo} />
                {(photo.caption || photo.category) && (
                  <Text style={styles.photoCaption}>{photo.caption || photo.category}</Text>
                )}
              </View>
            ))}
          </View>

          {/* Footer on last page only */}
          {pageIndex === photoChunks.length - 1 && (
            <View style={styles.footer}>
              <Text>This report was generated by GradeMyBuilding</Text>
              <Text>© {new Date().getFullYear()} GradeMyBuilding. All rights reserved.</Text>
            </View>
          )}
        </Page>
      ))}

      {/* Footer page if no photos */}
      {photos.length === 0 && Object.keys(groupedItems).length === 0 && (
        <View style={styles.footer}>
          <Text>This report was generated by GradeMyBuilding</Text>
          <Text>© {new Date().getFullYear()} GradeMyBuilding. All rights reserved.</Text>
        </View>
      )}
    </Document>
  );
}
