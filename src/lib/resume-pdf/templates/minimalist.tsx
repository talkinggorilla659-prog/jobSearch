import { Document, Page, Text, View, StyleSheet } from '@react-pdf/renderer';
import { ResumeData } from '../types';
import { COLORS, FONT_SIZES, SPACING } from './shared';

const colors = COLORS.minimalist;

const styles = StyleSheet.create({
  page: {
    padding: SPACING.page + 15,
    fontFamily: 'Helvetica',
    fontSize: FONT_SIZES.body,
    lineHeight: 1.6,
    color: colors.text,
  },
  header: {
    marginBottom: SPACING.section + 16,
  },
  name: {
    fontSize: FONT_SIZES.name + 4,
    fontFamily: 'Helvetica',
    fontWeight: 300,
    color: colors.primary,
    marginBottom: 8,
    letterSpacing: 1,
  },
  contactRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  contactItem: {
    fontSize: FONT_SIZES.small,
    color: colors.muted,
    marginRight: 20,
  },
  section: {
    marginBottom: SPACING.section + 8,
  },
  sectionTitle: {
    fontSize: FONT_SIZES.small,
    fontFamily: 'Helvetica-Bold',
    color: colors.muted,
    marginBottom: SPACING.item + 4,
    textTransform: 'uppercase',
    letterSpacing: 2,
  },
  summary: {
    fontSize: FONT_SIZES.body,
    color: colors.text,
    lineHeight: 1.7,
  },
  experienceItem: {
    marginBottom: SPACING.item + 8,
  },
  jobHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'baseline',
    marginBottom: 2,
  },
  jobTitle: {
    fontSize: FONT_SIZES.body + 1,
    fontFamily: 'Helvetica-Bold',
    color: colors.primary,
  },
  dates: {
    fontSize: FONT_SIZES.small,
    color: colors.muted,
  },
  company: {
    fontSize: FONT_SIZES.body,
    color: colors.secondary,
    marginBottom: 6,
  },
  bulletItem: {
    flexDirection: 'row',
    marginBottom: 3,
    paddingLeft: 8,
  },
  bulletDash: {
    width: 12,
    fontSize: FONT_SIZES.body,
    color: colors.muted,
  },
  bulletText: {
    flex: 1,
    fontSize: FONT_SIZES.body,
    color: colors.text,
    lineHeight: 1.5,
  },
  educationItem: {
    marginBottom: SPACING.item + 4,
  },
  degree: {
    fontSize: FONT_SIZES.body,
    fontFamily: 'Helvetica-Bold',
    color: colors.text,
  },
  school: {
    fontSize: FONT_SIZES.body,
    color: colors.secondary,
  },
  year: {
    fontSize: FONT_SIZES.small,
    color: colors.muted,
  },
  skillsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  skillTag: {
    fontSize: FONT_SIZES.small,
    color: colors.text,
    backgroundColor: colors.border,
    paddingHorizontal: 8,
    paddingVertical: 3,
    marginRight: 6,
    marginBottom: 6,
    borderRadius: 2,
  },
  divider: {
    borderBottomWidth: 0.5,
    borderBottomColor: colors.border,
    marginVertical: 4,
  },
});

interface Props {
  data: ResumeData;
}

export function MinimalistResumePDF({ data }: Props) {
  return (
    <Document
      title={`${data.name} - Resume`}
      author={data.name}
      subject="Professional Resume"
      keywords="resume, cv, professional, career"
    >
      <Page size="LETTER" style={styles.page}>
        {/* Header - Clean and Simple */}
        <View style={styles.header}>
          <Text style={styles.name}>{data.name}</Text>
          <View style={styles.contactRow}>
            {data.contact.email && (
              <Text style={styles.contactItem}>{data.contact.email}</Text>
            )}
            {data.contact.phone && (
              <Text style={styles.contactItem}>{data.contact.phone}</Text>
            )}
            {data.contact.location && (
              <Text style={styles.contactItem}>{data.contact.location}</Text>
            )}
            {data.contact.linkedin && (
              <Text style={styles.contactItem}>{data.contact.linkedin}</Text>
            )}
          </View>
        </View>

        {/* Summary */}
        {data.summary && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>About</Text>
            <Text style={styles.summary}>{data.summary}</Text>
          </View>
        )}

        {/* Experience */}
        {data.experience.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Experience</Text>
            {data.experience.map((exp, index) => (
              <View key={index} style={styles.experienceItem}>
                <Text style={styles.jobTitle}>
                  {exp.title}{exp.dates ? `  |  ${exp.dates}` : ''}
                </Text>
                {exp.company && <Text style={styles.company}>{exp.company}</Text>}
                {exp.bullets.map((bullet, bulletIndex) => (
                  <View key={bulletIndex} style={styles.bulletItem}>
                    <Text style={styles.bulletDash}>—</Text>
                    <Text style={styles.bulletText}>{bullet}</Text>
                  </View>
                ))}
              </View>
            ))}
          </View>
        )}

        {/* Education */}
        {data.education.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Education</Text>
            {data.education.map((edu, index) => (
              <View key={index} style={styles.educationItem}>
                <Text style={styles.degree}>
                  {edu.degree}{edu.year ? `  |  ${edu.year}` : ''}
                </Text>
                {edu.school && <Text style={styles.school}>{edu.school}</Text>}
              </View>
            ))}
          </View>
        )}

        {/* Skills as Tags */}
        {data.skills.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Skills</Text>
            <View style={styles.skillsRow}>
              {data.skills.map((skill, index) => (
                <Text key={index} style={styles.skillTag}>
                  {skill}
                </Text>
              ))}
            </View>
          </View>
        )}

        {/* Certifications */}
        {data.certifications && data.certifications.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Certifications</Text>
            {data.certifications.map((cert, index) => (
              <View key={index} style={styles.bulletItem}>
                <Text style={styles.bulletDash}>—</Text>
                <Text style={styles.bulletText}>{cert}</Text>
              </View>
            ))}
          </View>
        )}
      </Page>
    </Document>
  );
}
