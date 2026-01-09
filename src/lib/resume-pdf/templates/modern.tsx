import { Document, Page, Text, View, StyleSheet } from '@react-pdf/renderer';
import { ResumeData } from '../types';
import { COLORS, FONT_SIZES, SPACING, BulletList, SkillsGrid } from './shared';

const colors = COLORS.modern;

const styles = StyleSheet.create({
  page: {
    padding: SPACING.page,
    fontFamily: 'Helvetica',
    fontSize: FONT_SIZES.body,
    lineHeight: 1.5,
    color: colors.text,
  },
  header: {
    marginBottom: SPACING.section + 4,
    borderBottomWidth: 2,
    borderBottomColor: colors.primary,
    paddingBottom: SPACING.section,
  },
  name: {
    fontSize: FONT_SIZES.name,
    fontFamily: 'Helvetica-Bold',
    color: colors.primary,
    marginBottom: 4,
  },
  title: {
    fontSize: FONT_SIZES.title,
    color: colors.secondary,
    marginBottom: 8,
  },
  contactRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 4,
  },
  contactItem: {
    fontSize: FONT_SIZES.small,
    color: colors.muted,
    marginRight: 16,
  },
  section: {
    marginBottom: SPACING.section,
  },
  sectionTitle: {
    fontSize: FONT_SIZES.sectionHeader,
    fontFamily: 'Helvetica-Bold',
    color: colors.primary,
    marginBottom: SPACING.item,
    textTransform: 'uppercase',
    letterSpacing: 1,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    paddingBottom: 4,
  },
  summary: {
    fontSize: FONT_SIZES.body,
    color: colors.text,
    lineHeight: 1.6,
  },
  experienceItem: {
    marginBottom: SPACING.item + 4,
  },
  experienceHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 2,
  },
  jobTitle: {
    fontSize: FONT_SIZES.body + 1,
    fontFamily: 'Helvetica-Bold',
    color: colors.text,
  },
  dates: {
    fontSize: FONT_SIZES.small,
    color: colors.muted,
  },
  company: {
    fontSize: FONT_SIZES.body,
    color: colors.secondary,
    marginBottom: 4,
  },
  educationItem: {
    marginBottom: SPACING.item,
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
});

interface Props {
  data: ResumeData;
}

export function ModernResumePDF({ data }: Props) {
  return (
    <Document
      title={`${data.name} - Resume`}
      author={data.name}
      subject="Professional Resume"
      keywords="resume, cv, professional, career"
    >
      <Page size="LETTER" style={styles.page}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.name}>{data.name}</Text>
          {data.title && <Text style={styles.title}>{data.title}</Text>}
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
            <Text style={styles.sectionTitle}>Professional Summary</Text>
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
                {exp.bullets.length > 0 && (
                  <BulletList items={exp.bullets} color={colors.text} />
                )}
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

        {/* Skills */}
        {data.skills.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Skills</Text>
            <SkillsGrid skills={data.skills} columns={3} color={colors.text} />
          </View>
        )}

        {/* Certifications */}
        {data.certifications && data.certifications.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Certifications</Text>
            <BulletList items={data.certifications} color={colors.text} />
          </View>
        )}
      </Page>
    </Document>
  );
}
