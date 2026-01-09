import { Document, Page, Text, View, StyleSheet } from '@react-pdf/renderer';
import { ResumeData } from '../types';
import { COLORS, FONT_SIZES, SPACING, BulletList } from './shared';

const colors = COLORS.classic;

const styles = StyleSheet.create({
  page: {
    padding: SPACING.page + 10,
    fontFamily: 'Times-Roman',
    fontSize: FONT_SIZES.body,
    lineHeight: 1.5,
    color: colors.text,
  },
  header: {
    marginBottom: SPACING.section + 8,
    textAlign: 'center',
    borderBottomWidth: 2,
    borderBottomColor: colors.primary,
    paddingBottom: SPACING.section,
  },
  name: {
    fontSize: FONT_SIZES.name + 2,
    fontFamily: 'Times-Bold',
    color: colors.primary,
    marginBottom: 4,
    textTransform: 'uppercase',
    letterSpacing: 2,
  },
  title: {
    fontSize: FONT_SIZES.title,
    fontFamily: 'Times-Italic',
    color: colors.secondary,
    marginBottom: 8,
  },
  contactText: {
    fontSize: FONT_SIZES.small,
    color: colors.muted,
  },
  section: {
    marginBottom: SPACING.section + 2,
  },
  sectionTitle: {
    fontSize: FONT_SIZES.sectionHeader + 1,
    fontFamily: 'Times-Bold',
    color: colors.primary,
    marginBottom: SPACING.item,
    textTransform: 'uppercase',
    letterSpacing: 1.5,
    textAlign: 'center',
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    paddingBottom: 4,
  },
  summary: {
    fontSize: FONT_SIZES.body,
    fontFamily: 'Times-Roman',
    color: colors.text,
    lineHeight: 1.6,
    textAlign: 'justify',
  },
  experienceItem: {
    marginBottom: SPACING.item + 6,
  },
  experienceHeader: {
    marginBottom: 4,
  },
  jobTitleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  jobTitle: {
    fontSize: FONT_SIZES.body + 1,
    fontFamily: 'Times-Bold',
    color: colors.text,
  },
  dates: {
    fontSize: FONT_SIZES.body,
    fontFamily: 'Times-Italic',
    color: colors.muted,
  },
  company: {
    fontSize: FONT_SIZES.body,
    fontFamily: 'Times-Italic',
    color: colors.secondary,
    marginBottom: 4,
  },
  educationItem: {
    marginBottom: SPACING.item + 2,
  },
  degree: {
    fontSize: FONT_SIZES.body,
    fontFamily: 'Times-Bold',
    color: colors.text,
  },
  school: {
    fontSize: FONT_SIZES.body,
    fontFamily: 'Times-Italic',
    color: colors.secondary,
  },
  year: {
    fontSize: FONT_SIZES.body,
    fontFamily: 'Times-Roman',
    color: colors.muted,
  },
  skillsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  skillItem: {
    fontSize: FONT_SIZES.body,
    color: colors.text,
    marginRight: 8,
    marginBottom: 4,
  },
});

interface Props {
  data: ResumeData;
}

export function ClassicResumePDF({ data }: Props) {
  const contactParts = [
    data.contact.email,
    data.contact.phone,
    data.contact.location,
    data.contact.linkedin,
  ].filter(Boolean);

  return (
    <Document
      title={`${data.name} - Resume`}
      author={data.name}
      subject="Professional Resume"
      keywords="resume, cv, professional, career"
    >
      <Page size="LETTER" style={styles.page}>
        {/* Header - Centered, Formal */}
        <View style={styles.header}>
          <Text style={styles.name}>{data.name}</Text>
          {data.title && <Text style={styles.title}>{data.title}</Text>}
          <Text style={styles.contactText}>{contactParts.join('  |  ')}</Text>
        </View>

        {/* Summary/Objective */}
        {data.summary && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Professional Summary</Text>
            <Text style={styles.summary}>{data.summary}</Text>
          </View>
        )}

        {/* Professional Experience */}
        {data.experience.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Professional Experience</Text>
            {data.experience.map((exp, index) => (
              <View key={index} style={styles.experienceItem}>
                <View style={styles.experienceHeader}>
                  <Text style={styles.jobTitle}>
                    {exp.title}{exp.dates ? `  |  ${exp.dates}` : ''}
                  </Text>
                  {exp.company && <Text style={styles.company}>{exp.company}</Text>}
                </View>
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
            <Text style={styles.sectionTitle}>Skills & Competencies</Text>
            <Text style={{ fontSize: FONT_SIZES.body, color: colors.text, lineHeight: 1.6 }}>
              {data.skills.join('  |  ')}
            </Text>
          </View>
        )}

        {/* Certifications */}
        {data.certifications && data.certifications.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Certifications & Licenses</Text>
            <BulletList items={data.certifications} color={colors.text} />
          </View>
        )}
      </Page>
    </Document>
  );
}
