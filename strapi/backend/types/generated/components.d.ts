import type { Schema, Struct } from '@strapi/strapi';

export interface AboutMainAboutMain extends Struct.ComponentSchema {
  collectionName: 'components_about_main_about_mains';
  info: {
    displayName: 'AboutMain';
  };
  attributes: {
    CTA: Schema.Attribute.Text;
    description: Schema.Attribute.Blocks;
    img: Schema.Attribute.Media<'images' | 'files' | 'videos' | 'audios'>;
    Title: Schema.Attribute.String;
  };
}

export interface AboutAbout extends Struct.ComponentSchema {
  collectionName: 'components_about_abouts';
  info: {
    displayName: 'About';
  };
  attributes: {
    CTA: Schema.Attribute.String;
    FirstSentence: Schema.Attribute.Text;
    img1: Schema.Attribute.Media<'images' | 'files' | 'videos' | 'audios'>;
    img2: Schema.Attribute.Media<'images' | 'files' | 'videos' | 'audios'>;
    img3: Schema.Attribute.Media<'images' | 'files' | 'videos' | 'audios'>;
    SecondSentence: Schema.Attribute.Text;
    Title: Schema.Attribute.String;
  };
}

export interface ApproachApproach extends Struct.ComponentSchema {
  collectionName: 'components_approach_approaches';
  info: {
    displayName: 'approach';
  };
  attributes: {
    CTA: Schema.Attribute.String;
    desc: Schema.Attribute.String;
    desc1: Schema.Attribute.String;
    desc2: Schema.Attribute.String;
    desc3: Schema.Attribute.String;
    FirstDesc3: Schema.Attribute.String;
    firstDesc4: Schema.Attribute.String;
    img: Schema.Attribute.Media<'images' | 'files' | 'videos' | 'audios'>;
    SecondDesc3: Schema.Attribute.Text;
    SecondDesc4: Schema.Attribute.String;
    title: Schema.Attribute.String;
    title1: Schema.Attribute.String;
    title2: Schema.Attribute.String;
    title3: Schema.Attribute.String;
    title4: Schema.Attribute.String;
    videoLink: Schema.Attribute.String;
  };
}

export interface ComponentsComponents extends Struct.ComponentSchema {
  collectionName: 'components_components_components';
  info: {
    displayName: 'Components';
  };
  attributes: {
    Json: Schema.Attribute.JSON;
  };
}

export interface ConsultationConsultation extends Struct.ComponentSchema {
  collectionName: 'components_consultation_consultations';
  info: {
    displayName: 'Consultation';
  };
  attributes: {
    CTA1: Schema.Attribute.String;
    CTA2: Schema.Attribute.String;
    FirstSentance: Schema.Attribute.Text;
    firstTitle: Schema.Attribute.String;
    img: Schema.Attribute.Media<'images' | 'files' | 'videos' | 'audios'>;
    MainTitle: Schema.Attribute.String;
    SecondSentance: Schema.Attribute.Text;
  };
}

export interface ContactPageContactPage extends Struct.ComponentSchema {
  collectionName: 'components_contact_page_contact_pages';
  info: {
    displayName: 'contactPage';
  };
  attributes: {
    adress: Schema.Attribute.String;
    email: Schema.Attribute.String;
    img1: Schema.Attribute.Media<'images' | 'files' | 'videos' | 'audios'>;
    mapTitle: Schema.Attribute.String;
    PageTitle: Schema.Attribute.String;
    phone: Schema.Attribute.String;
    Submitbtn: Schema.Attribute.String;
  };
}

export interface DiffrenceDiffrence extends Struct.ComponentSchema {
  collectionName: 'components_diffrence_diffrences';
  info: {
    displayName: 'Diffrence';
  };
  attributes: {
    CTA: Schema.Attribute.String;
    img: Schema.Attribute.Media<'images' | 'files' | 'videos' | 'audios'>;
    journeyDescStep1: Schema.Attribute.Text;
    journeyDescStep2: Schema.Attribute.Text;
    journeyDescStep3: Schema.Attribute.String;
    journeyDescStep4: Schema.Attribute.String;
    journeyDescStep5: Schema.Attribute.String;
    journeyTitleStep1: Schema.Attribute.String;
    journeyTitleStep2: Schema.Attribute.String;
    journeyTitleStep3: Schema.Attribute.String;
    journeyTitleStep4: Schema.Attribute.String;
    journeyTitleStep5: Schema.Attribute.String;
    Title1: Schema.Attribute.String;
    Title2: Schema.Attribute.String;
    VideoDesc: Schema.Attribute.String;
    VideoLink: Schema.Attribute.String;
    VideoTitel: Schema.Attribute.String;
  };
}

export interface EventEvent extends Struct.ComponentSchema {
  collectionName: 'components_event_events';
  info: {
    displayName: 'event';
  };
  attributes: {
    content: Schema.Attribute.Blocks;
  };
}

export interface FeaturedSectionFeaturedSection extends Struct.ComponentSchema {
  collectionName: 'components_featured_section_featured_sections';
  info: {
    displayName: 'FeaturedSection';
  };
  attributes: {
    img1: Schema.Attribute.Media<'images' | 'files' | 'videos' | 'audios'>;
    img2: Schema.Attribute.Media<'images' | 'files' | 'videos' | 'audios'>;
    img3: Schema.Attribute.Media<'images' | 'files' | 'videos' | 'audios'>;
    img4: Schema.Attribute.Media<'images' | 'files' | 'videos' | 'audios'>;
    Title: Schema.Attribute.String;
  };
}

export interface GoalsGoals extends Struct.ComponentSchema {
  collectionName: 'components_goals_goals';
  info: {
    displayName: 'goals';
  };
  attributes: {
    desc1: Schema.Attribute.Text;
    desc2: Schema.Attribute.Text;
    desc3: Schema.Attribute.Text;
    firstTitle: Schema.Attribute.String;
    img1: Schema.Attribute.Media<'images' | 'files' | 'videos' | 'audios'>;
    img2: Schema.Attribute.Media<'images' | 'files' | 'videos' | 'audios'>;
    img3: Schema.Attribute.Media<'images' | 'files' | 'videos' | 'audios'>;
    mainTitle: Schema.Attribute.String;
    title1: Schema.Attribute.String;
    title2: Schema.Attribute.String;
    title3: Schema.Attribute.String;
  };
}

export interface HeroComponentHeroComponent extends Struct.ComponentSchema {
  collectionName: 'components_hero_component_hero_components';
  info: {
    displayName: 'heroComponent';
  };
  attributes: {
    background: Schema.Attribute.Media<
      'images' | 'files' | 'videos' | 'audios'
    >;
    CTA1: Schema.Attribute.String;
    CTA2: Schema.Attribute.String;
    desc: Schema.Attribute.String;
    HowItWorks: Schema.Attribute.String;
    Title: Schema.Attribute.String;
    Welcoming: Schema.Attribute.String;
  };
}

export interface LastSectionLastSection extends Struct.ComponentSchema {
  collectionName: 'components_last_section_last_sections';
  info: {
    displayName: 'LastSection';
  };
  attributes: {
    CTA: Schema.Attribute.String;
    desc: Schema.Attribute.String;
    img: Schema.Attribute.Media<'images' | 'files' | 'videos' | 'audios'>;
    number: Schema.Attribute.String;
    title: Schema.Attribute.String;
  };
}

export interface LetUsHelpYouLetUsHelpYou extends Struct.ComponentSchema {
  collectionName: 'components_let_us_help_you_let_us_help_yous';
  info: {
    displayName: 'LetUSHelpYou';
  };
  attributes: {
    img: Schema.Attribute.Media<'images' | 'files' | 'videos' | 'audios'>;
    PhoneNumber: Schema.Attribute.String;
    Sentance1: Schema.Attribute.Text;
    Sentance2: Schema.Attribute.Text;
    Title: Schema.Attribute.String;
  };
}

export interface MapMap extends Struct.ComponentSchema {
  collectionName: 'components_map_maps';
  info: {
    displayName: 'Map';
  };
  attributes: {
    backgorund: Schema.Attribute.Media<
      'images' | 'files' | 'videos' | 'audios'
    >;
    Hours: Schema.Attribute.JSON;
    HoursTitle: Schema.Attribute.String;
  };
}

export interface MediaPageMediaPage extends Struct.ComponentSchema {
  collectionName: 'components_media_page_media_pages';
  info: {
    displayName: 'MediaPage';
  };
  attributes: {
    title: Schema.Attribute.String;
    vediolink: Schema.Attribute.Media<'images' | 'files' | 'videos' | 'audios'>;
  };
}

export interface MediaPartMediaPart extends Struct.ComponentSchema {
  collectionName: 'components_media_part_media_parts';
  info: {
    displayName: 'mediaPart';
  };
  attributes: {
    Content: Schema.Attribute.Blocks;
    img: Schema.Attribute.Media<'images' | 'files' | 'videos' | 'audios'>;
    title: Schema.Attribute.String;
    vediolink: Schema.Attribute.String;
  };
}

export interface MediaMedia extends Struct.ComponentSchema {
  collectionName: 'components_media_media';
  info: {
    displayName: 'Media';
  };
  attributes: {
    Content: Schema.Attribute.Blocks;
    img: Schema.Attribute.Media<'images' | 'files' | 'videos' | 'audios'>;
    vediolink: Schema.Attribute.String;
  };
}

export interface MessagePageMessagePage extends Struct.ComponentSchema {
  collectionName: 'components_message_page_message_pages';
  info: {
    displayName: 'MessagePage';
  };
  attributes: {
    Components: Schema.Attribute.Component<'components.components', true>;
    Team: Schema.Attribute.JSON;
    WhyMessage: Schema.Attribute.JSON;
  };
}

export interface OurTeamPageFirstPartOurTeamPageFirstPart
  extends Struct.ComponentSchema {
  collectionName: 'components_our_team_page_first_part_our_team_page_first_parts';
  info: {
    displayName: 'OurTeamPage-firstPart';
  };
  attributes: {};
}

export interface OurTeamPageOurTeamPage extends Struct.ComponentSchema {
  collectionName: 'components_our_team_page_our_team_pages';
  info: {
    displayName: 'OurTeamPage';
  };
  attributes: {
    CTA: Schema.Attribute.String;
    member1Desc: Schema.Attribute.String;
    member1Img: Schema.Attribute.Media<
      'images' | 'files' | 'videos' | 'audios'
    >;
    member1Job: Schema.Attribute.String;
    member1Title: Schema.Attribute.String;
    member2Desc: Schema.Attribute.String;
    member2Img: Schema.Attribute.Media<
      'images' | 'files' | 'videos' | 'audios'
    >;
    member2Job: Schema.Attribute.String;
    member2Title: Schema.Attribute.String;
    member3Desc: Schema.Attribute.String;
    member3Img: Schema.Attribute.Media<
      'images' | 'files' | 'videos' | 'audios'
    >;
    member3Job: Schema.Attribute.String;
    member3Title: Schema.Attribute.String;
    member4Desc: Schema.Attribute.String;
    member4Img: Schema.Attribute.String;
    member4Job: Schema.Attribute.String;
    member4Title: Schema.Attribute.String;
    Title: Schema.Attribute.String;
  };
}

export interface OurTeamSectionOurTeamSection extends Struct.ComponentSchema {
  collectionName: 'components_our_team_section_our_team_sections';
  info: {
    displayName: 'ourTeamSection';
  };
  attributes: {
    CTA: Schema.Attribute.String;
    member1Desc: Schema.Attribute.String;
    member1Img: Schema.Attribute.Media<
      'images' | 'files' | 'videos' | 'audios'
    >;
    member1Job: Schema.Attribute.String;
    member1Title: Schema.Attribute.String;
    member2Desc: Schema.Attribute.String;
    member2Img: Schema.Attribute.Media<
      'images' | 'files' | 'videos' | 'audios'
    >;
    member2Job: Schema.Attribute.String;
    member2Title: Schema.Attribute.String;
    member3Desc: Schema.Attribute.String;
    member3Img: Schema.Attribute.Media<
      'images' | 'files' | 'videos' | 'audios'
    >;
    member3Job: Schema.Attribute.String;
    member3Title: Schema.Attribute.String;
    member4Desc: Schema.Attribute.String;
    member4Img: Schema.Attribute.Media<
      'images' | 'files' | 'videos' | 'audios'
    >;
    member4Job: Schema.Attribute.String;
    member4Title: Schema.Attribute.String;
    Title: Schema.Attribute.String;
  };
}

export interface OurTeamOurTeam extends Struct.ComponentSchema {
  collectionName: 'components_our_team_our_teams';
  info: {
    displayName: 'OurTeam';
  };
  attributes: {
    member1Title: Schema.Attribute.String;
    Title: Schema.Attribute.String;
  };
}

export interface SectionSection extends Struct.ComponentSchema {
  collectionName: 'components_section_sections';
  info: {
    displayName: 'section';
  };
  attributes: {
    description: Schema.Attribute.Blocks;
    img: Schema.Attribute.Media<'images' | 'files' | 'videos' | 'audios'>;
    reverse: Schema.Attribute.Boolean;
    Title: Schema.Attribute.String;
  };
}

export interface ServicesServices extends Struct.ComponentSchema {
  collectionName: 'components_services_services';
  info: {
    displayName: 'Services';
  };
  attributes: {
    section: Schema.Attribute.Component<'section.section', true>;
  };
}

export interface SliderAnimationSliderAnimation extends Struct.ComponentSchema {
  collectionName: 'components_slider_animation_slider_animations';
  info: {
    displayName: 'SliderAnimation';
  };
  attributes: {
    treatments: Schema.Attribute.JSON;
  };
}

export interface TeamPageTeamPage extends Struct.ComponentSchema {
  collectionName: 'components_team_page_team_pages';
  info: {
    displayName: 'teamPage';
  };
  attributes: {
    CTA: Schema.Attribute.String;
    member1Desc: Schema.Attribute.String;
    member1Img: Schema.Attribute.Media<
      'images' | 'files' | 'videos' | 'audios'
    >;
    member1Job: Schema.Attribute.String;
    member1Title: Schema.Attribute.String;
    member2Desc: Schema.Attribute.String;
    member2Img: Schema.Attribute.Media<
      'images' | 'files' | 'videos' | 'audios'
    >;
    member2Job: Schema.Attribute.String;
    member2Title: Schema.Attribute.String;
    member3Desc: Schema.Attribute.String;
    member3Img: Schema.Attribute.Media<
      'images' | 'files' | 'videos' | 'audios'
    >;
    member3Job: Schema.Attribute.String;
    member3Title: Schema.Attribute.String;
    member4Desc: Schema.Attribute.String;
    member4Img: Schema.Attribute.String;
    member4Job: Schema.Attribute.String;
    member4Title: Schema.Attribute.String;
    Title: Schema.Attribute.String;
  };
}

export interface TeamTeam extends Struct.ComponentSchema {
  collectionName: 'components_team_teams';
  info: {
    displayName: 'team';
  };
  attributes: {};
}

export interface TeamsLandingTeamsLanding extends Struct.ComponentSchema {
  collectionName: 'components_teams_landing_teams_landings';
  info: {
    displayName: 'Teams-landing';
  };
  attributes: {
    CTA: Schema.Attribute.String;
    FirstTitle: Schema.Attribute.String;
    MainTitle: Schema.Attribute.String;
    memberFiveImg: Schema.Attribute.String;
    memberFiveJob: Schema.Attribute.String;
    memberFiveName: Schema.Attribute.String;
    memberFourImg: Schema.Attribute.Media<
      'images' | 'files' | 'videos' | 'audios'
    >;
    memberFourJob: Schema.Attribute.String;
    memberFourName: Schema.Attribute.String;
    memberOneImg: Schema.Attribute.Media<
      'images' | 'files' | 'videos' | 'audios'
    >;
    memberOneJob: Schema.Attribute.String;
    memberOneName: Schema.Attribute.String;
    memberSevenImg: Schema.Attribute.Media<
      'images' | 'files' | 'videos' | 'audios'
    >;
    memberSevenJob: Schema.Attribute.String;
    memberSevenName: Schema.Attribute.String;
    memberSixImg: Schema.Attribute.Media<
      'images' | 'files' | 'videos' | 'audios'
    >;
    memberSixJob: Schema.Attribute.String;
    memberSixName: Schema.Attribute.String;
    memberThreeImg: Schema.Attribute.Media<
      'images' | 'files' | 'videos' | 'audios'
    >;
    memberThreeJob: Schema.Attribute.String;
    memberThreeName: Schema.Attribute.String;
    memberTwoImg: Schema.Attribute.Media<
      'images' | 'files' | 'videos' | 'audios'
    >;
    memberTwoJob: Schema.Attribute.String;
    memberTwoName: Schema.Attribute.String;
  };
}

export interface TeamsPartTeamsPart extends Struct.ComponentSchema {
  collectionName: 'components_teams_part_teams_parts';
  info: {
    displayName: 'TeamsPart';
  };
  attributes: {
    cta: Schema.Attribute.String;
    FirstTitle: Schema.Attribute.String;
    MainTitle: Schema.Attribute.String;
    memberFiveImg: Schema.Attribute.Media<
      'images' | 'files' | 'videos' | 'audios'
    >;
    memberFiveJob: Schema.Attribute.String;
    memberFiveName: Schema.Attribute.String;
    memberFourImg: Schema.Attribute.Media<
      'images' | 'files' | 'videos' | 'audios'
    >;
    memberFourJob: Schema.Attribute.String;
    memberFourName: Schema.Attribute.String;
    memberOneImg: Schema.Attribute.Media<
      'images' | 'files' | 'videos' | 'audios'
    >;
    memberOneJob: Schema.Attribute.String;
    memberOneName: Schema.Attribute.String;
    memberSevenImg: Schema.Attribute.Media<
      'images' | 'files' | 'videos' | 'audios'
    >;
    memberSevenJob: Schema.Attribute.String;
    memberSevenName: Schema.Attribute.String;
    memberSixImg: Schema.Attribute.Media<
      'images' | 'files' | 'videos' | 'audios'
    >;
    memberSixJob: Schema.Attribute.String;
    memberSixName: Schema.Attribute.String;
    memberThreeImg: Schema.Attribute.Media<
      'images' | 'files' | 'videos' | 'audios'
    >;
    memberThreeJob: Schema.Attribute.String;
    memberThreeName: Schema.Attribute.String;
    memberTwoImg: Schema.Attribute.Media<
      'images' | 'files' | 'videos' | 'audios'
    >;
    memberTwoJob: Schema.Attribute.String;
    memberTwoName: Schema.Attribute.String;
  };
}

export interface TeamsSectionTeamsSection extends Struct.ComponentSchema {
  collectionName: 'components_teams_section_teams_sections';
  info: {
    displayName: 'teamsSection';
  };
  attributes: {
    FirstTitle: Schema.Attribute.String;
    MainTitle: Schema.Attribute.String;
    memberFiveImg: Schema.Attribute.Media<
      'images' | 'files' | 'videos' | 'audios'
    >;
    memberFiveJob: Schema.Attribute.String;
    memberFiveName: Schema.Attribute.String;
    memberFourImg: Schema.Attribute.String;
    memberFourJob: Schema.Attribute.String;
    memberFourName: Schema.Attribute.String;
    memberOneImg: Schema.Attribute.Media<
      'images' | 'files' | 'videos' | 'audios'
    >;
    memberOneJob: Schema.Attribute.String;
    memberOneName: Schema.Attribute.String;
    memberSevenImg: Schema.Attribute.Media<
      'images' | 'files' | 'videos' | 'audios'
    >;
    memberSevenJob: Schema.Attribute.String;
    memberSevenName: Schema.Attribute.String;
    memberSixImg: Schema.Attribute.Media<
      'images' | 'files' | 'videos' | 'audios'
    >;
    memberSixJob: Schema.Attribute.String;
    memberSixName: Schema.Attribute.String;
    memberThreeImg: Schema.Attribute.Media<
      'images' | 'files' | 'videos' | 'audios'
    >;
    memberThreeJob: Schema.Attribute.String;
    memberThreeName: Schema.Attribute.String;
    memberTwoImg: Schema.Attribute.Media<
      'images' | 'files' | 'videos' | 'audios'
    >;
    memberTwoJob: Schema.Attribute.String;
    memberTwoName: Schema.Attribute.String;
  };
}

export interface TeamsTeams extends Struct.ComponentSchema {
  collectionName: 'components_teams_teams';
  info: {
    displayName: 'Teams';
  };
  attributes: {
    FirstTitle: Schema.Attribute.String;
    MainTitle: Schema.Attribute.String;
    memberFiveImg: Schema.Attribute.Media<
      'images' | 'files' | 'videos' | 'audios'
    >;
    memberFiveJob: Schema.Attribute.String;
    memberFiveName: Schema.Attribute.String;
    memberFourImg: Schema.Attribute.Media<
      'images' | 'files' | 'videos' | 'audios'
    >;
    memberFourJob: Schema.Attribute.String;
    memberFourName: Schema.Attribute.Media<
      'images' | 'files' | 'videos' | 'audios'
    >;
    memberOneImg: Schema.Attribute.Media<
      'images' | 'files' | 'videos' | 'audios'
    >;
    memberOneJob: Schema.Attribute.String;
    memberOneName: Schema.Attribute.String;
    memberSevenImg: Schema.Attribute.Media<
      'images' | 'files' | 'videos' | 'audios'
    >;
    memberSevenJob: Schema.Attribute.String;
    memberSevenName: Schema.Attribute.String;
    memberSixImg: Schema.Attribute.Media<
      'images' | 'files' | 'videos' | 'audios'
    >;
    memberSixJob: Schema.Attribute.String;
    memberSixName: Schema.Attribute.String;
    memberThreeImg: Schema.Attribute.Media<
      'images' | 'files' | 'videos' | 'audios'
    >;
    memberThreeJob: Schema.Attribute.String;
    memberThreeName: Schema.Attribute.String;
    memberTwoImg: Schema.Attribute.Media<
      'images' | 'files' | 'videos' | 'audios'
    >;
    memberTwoJob: Schema.Attribute.String;
    memberTwoName: Schema.Attribute.String;
  };
}

export interface TreatmentsTreatments extends Struct.ComponentSchema {
  collectionName: 'components_treatments_treatments';
  info: {
    displayName: 'Treatments';
  };
  attributes: {
    CTA: Schema.Attribute.String;
    Type: Schema.Attribute.Component<'type.type', true>;
  };
}

export interface TypeType extends Struct.ComponentSchema {
  collectionName: 'components_type_types';
  info: {
    displayName: 'Type';
    icon: '';
  };
  attributes: {
    field: Schema.Attribute.String;
  };
}

export interface VisibleResultsAboutVisibleResultsAbout
  extends Struct.ComponentSchema {
  collectionName: 'components_visible_results_about_visible_results_abouts';
  info: {
    displayName: 'visible-results-about';
  };
  attributes: {
    CTA: Schema.Attribute.String;
    Slider: Schema.Attribute.Media<
      'images' | 'files' | 'videos' | 'audios',
      true
    >;
    Title: Schema.Attribute.String;
    VideoDesc: Schema.Attribute.Text;
    VideoLink: Schema.Attribute.String;
    VideoTitle: Schema.Attribute.String;
  };
}

export interface WhatToExpectWhatToExpect extends Struct.ComponentSchema {
  collectionName: 'components_what_to_expect_what_to_expects';
  info: {
    displayName: 'WhatToExpect';
  };
  attributes: {
    CTA: Schema.Attribute.String;
    Desc: Schema.Attribute.String;
    desc1: Schema.Attribute.Blocks;
    desc2: Schema.Attribute.Blocks;
    desc3: Schema.Attribute.Blocks;
    desc4: Schema.Attribute.Blocks;
    Title: Schema.Attribute.String;
    title1: Schema.Attribute.String;
    title2: Schema.Attribute.String;
    title3: Schema.Attribute.String;
    title4: Schema.Attribute.String;
  };
}

export interface WhyChooseWhyChoose extends Struct.ComponentSchema {
  collectionName: 'components_why_choose_why_chooses';
  info: {
    displayName: 'whyChoose';
  };
  attributes: {
    firstDesc: Schema.Attribute.String;
    firstIcon: Schema.Attribute.Media<'images' | 'files' | 'videos' | 'audios'>;
    firstTitle: Schema.Attribute.String;
    secondDesc: Schema.Attribute.String;
    secondIcon: Schema.Attribute.Media<
      'images' | 'files' | 'videos' | 'audios'
    >;
    secondTitle: Schema.Attribute.String;
    ThirdDesc: Schema.Attribute.String;
    ThirdIcon: Schema.Attribute.Media<'images' | 'files' | 'videos' | 'audios'>;
    ThirdTitle: Schema.Attribute.String;
  };
}

declare module '@strapi/strapi' {
  export module Public {
    export interface ComponentSchemas {
      'about-main.about-main': AboutMainAboutMain;
      'about.about': AboutAbout;
      'approach.approach': ApproachApproach;
      'components.components': ComponentsComponents;
      'consultation.consultation': ConsultationConsultation;
      'contact-page.contact-page': ContactPageContactPage;
      'diffrence.diffrence': DiffrenceDiffrence;
      'event.event': EventEvent;
      'featured-section.featured-section': FeaturedSectionFeaturedSection;
      'goals.goals': GoalsGoals;
      'hero-component.hero-component': HeroComponentHeroComponent;
      'last-section.last-section': LastSectionLastSection;
      'let-us-help-you.let-us-help-you': LetUsHelpYouLetUsHelpYou;
      'map.map': MapMap;
      'media-page.media-page': MediaPageMediaPage;
      'media-part.media-part': MediaPartMediaPart;
      'media.media': MediaMedia;
      'message-page.message-page': MessagePageMessagePage;
      'our-team-page-first-part.our-team-page-first-part': OurTeamPageFirstPartOurTeamPageFirstPart;
      'our-team-page.our-team-page': OurTeamPageOurTeamPage;
      'our-team-section.our-team-section': OurTeamSectionOurTeamSection;
      'our-team.our-team': OurTeamOurTeam;
      'section.section': SectionSection;
      'services.services': ServicesServices;
      'slider-animation.slider-animation': SliderAnimationSliderAnimation;
      'team-page.team-page': TeamPageTeamPage;
      'team.team': TeamTeam;
      'teams-landing.teams-landing': TeamsLandingTeamsLanding;
      'teams-part.teams-part': TeamsPartTeamsPart;
      'teams-section.teams-section': TeamsSectionTeamsSection;
      'teams.teams': TeamsTeams;
      'treatments.treatments': TreatmentsTreatments;
      'type.type': TypeType;
      'visible-results-about.visible-results-about': VisibleResultsAboutVisibleResultsAbout;
      'what-to-expect.what-to-expect': WhatToExpectWhatToExpect;
      'why-choose.why-choose': WhyChooseWhyChoose;
    }
  }
}
