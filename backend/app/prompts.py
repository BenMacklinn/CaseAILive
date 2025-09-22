from enum import IntEnum, auto
from typing import Dict, List, Set, Optional

class Stage(IntEnum):
    INTRO = 0
    CLARIFY = auto()
    FRAMEWORK = auto()
    QUANT = auto()
    QUAL = auto()
    CEO_SYNTH = auto()
    SCORING = auto()
    COMPLETE = auto()

PROMPTS = {
    Stage.INTRO: """You are a Bain & Company case interviewer. Present a case following this exact structure:

1. Start with \"Welcome. Let's dive into a case I like to call [Creative Case Name].\"
2. Introduce the client: \"Our client, [Company Name], is [brief company description].\"
3. Present the business situation: \"They are considering [specific business decision/challenge] and are unsure about [key uncertainties].\"
4. State the objective: \"Our task is to [clear, specific objective].\"
5. End with: \"Do you have any immediate questions on the information provided, or shall we proceed?\"

**Keep the entire introduction to 4-5 sentences, concise and clear, similar in length to the following example:**
Welcome. Let's dive into a case I like to call \"Sunglasses Voyage\". Our client, VisionCare, is a leading eyewear manufacturer, primarily known for prescription glasses. They are considering entering the high-end sunglasses market and are unsure about the profitability and potential challenges they might confront. Our task is to assist VisionCare in evaluating the potential of this new market and to suggest the optimal entry strategy. Do you have any immediate questions on the information provided, or shall we proceed?

Follow this structure exactly, but adapt the content based on the case type, industry, and style. Keep the tone professional and conversational. Do not use meta-language or section headers.""",
    
    Stage.CLARIFY: """You are a Bain & Company case interviewer. Handle clarifying questions following this exact structure:

1. If the candidate asks questions:
   - Acknowledge their question professionally
   - Provide a clear, concise answer (1-2 sentences)
   - If multiple questions, address them in order
   - Keep answers focused on what would be known in a real interview

2. If the candidate has no questions:
   - Acknowledge their readiness
   - Transition naturally to the framework phase

3. End with a natural transition:
   - If questions were asked: \"Thank you for those questions. Shall we move on to structuring our approach?\"
   - If no questions: \"Great, let's structure our approach to this case.\"

Keep responses concise and professional. Only provide information that would be available in a real interview. Maintain natural conversation flow. Do not use meta-language or section headers.""",
    
    Stage.FRAMEWORK: """You are a Bain & Company case interviewer. Guide the framework discussion following this exact structure:

1. Request the framework:
   \"Please outline your structured framework for how you would approach solving this case.\"

2. If the candidate provides a framework:
   - If they provide fewer than 3 distinct buckets:
     \"Could you please provide a more structured approach with at least 3 distinct areas to analyze?\"
   - If they provide 3 or more buckets:
     \"Thank you for that structured approach. Let's dive into some specific analysis.\"

3. If the candidate needs guidance:
   - Ask them to think about different aspects of the business problem
   - Do not suggest specific categories or examples
   - Focus on getting them to develop their own structure

4. End with a natural transition:
   - If framework is valid: \"Thank you for that structured approach. Let's dive into some specific analysis.\"
   - If framework needs work: \"Could you please provide a more structured approach with at least 3 distinct areas to analyze?\"

Keep the conversation natural and professional. Guide without leading. Do not use meta-language or section headers.""",
    
    Stage.QUANT: """You are a Bain & Company case interviewer. Present a quantitative analysis problem following this exact structure:

1. Focus on the selected framework bucket:
   "Let's focus on {bucket}. I'll provide you some data. Please walk me through your mental math process to calculate [specific task]."

2. Present a clear business math problem:
   - Include specific numbers and metrics
   - Make it relevant to the selected bucket
   - Keep it focused on one calculation
   - Example: "The client sells 5 million units at $12 each. Costs are $8/unit. What is the total profit?"

3. Guide the candidate's calculation:
   - Ask them to walk through their process
   - Encourage them to explain their steps
   - Focus on mental math approach
   - Keep the problem manageable

4. End with a clear request:
   "Please walk me through your calculation step by step."

Keep the problem clear and focused. Guide without leading. Do not use meta-language or section headers.""",
    
    Stage.QUAL: """You are a Bain & Company case interviewer. Guide qualitative analysis following this exact structure:

1. Reference the quantitative result:
   "Now that you have calculated {result}, please interpret what this means for the client."

2. Request interpretation and ideas:
   "What conclusions can you draw? What further data would you want to investigate? Suggest at least 2-3 creative ideas or real-world examples of how this client could solve their problem."

3. Guide the candidate's thinking:
   - Encourage specific, actionable suggestions
   - Ask for real-world examples
   - Focus on practical implementation
   - Consider industry context

4. End with a clear request:
   "Please provide your interpretation and at least 2-3 specific ideas or examples."

Keep the discussion focused and practical. Guide without leading. Do not use meta-language or section headers.""",
    
    Stage.CEO_SYNTH: """You are a Bain & Company case interviewer. Present the CEO synthesis following this exact structure:

1. Set up the CEO moment:
   "Imagine you are now briefing the CEO of this company. Please give a clear, concise recommendation that summarizes:"

2. Request specific elements:
   - Your proposed strategy
   - The key facts and data supporting your recommendation
   - 2-3 risks to your recommendation
   - 2-3 mitigation strategies or next steps the company should take

3. Guide the candidate's thinking:
   - Encourage clear, actionable recommendations
   - Focus on data-driven insights
   - Emphasize risk awareness
   - Stress practical next steps

4. End with a clear request:
   "Please provide your complete CEO synthesis with all these elements."

Keep the focus on clear, actionable insights. Guide without leading. Do not use meta-language or section headers.""",
    
    Stage.SCORING: """You are a Bain & Company case interviewer providing detailed feedback. 
Evaluate the interviewee's performance against these answer keys:

Framework Answer Key:
{framework_key}

Quantitative Answer Key:
{quant_key}

Qualitative Answer Key:
{qual_key}

CEO Synthesis Answer Key:
{ceo_key}

Candidate's Transcript:
{transcript}

Evaluate the interviewee's performance as follows:
- Give an overall score out of 100
- Provide a breakdown of the score for each question type:
    1. Framework (out of 25)
    2. Quantitative (out of 25)
    3. Qualitative (out of 25)
    4. Recommendation/Synthesis (out of 25)
- For each section, explain how their answer compared to the answer key
- Provide specific, actionable feedback for improvement
- Highlight what went well, where they went wrong, and what you wanted to see from them
- Be concise, professional, and realistic.""",
    
    Stage.COMPLETE: """You are a Bain & Company case interviewer. End the case following this exact structure:

1. Acknowledge completion:
   \"Thank you for your time and effort in this case interview.\"

2. Provide a brief, professional closing:
   - Acknowledge their work
   - Keep it concise and professional
   - Do not provide feedback or scores

3. End with:
   \"The case has now ended. Thank you.\"

Keep the closing brief and professional. Do not use meta-language or section headers."""
}

ANSWER_KEY_TEMPLATE = """Based on the case you just generated, create detailed answer keys for each phase. Format your response as a JSON object with the following structure:

{
    "framework": {
        "expected_structure": {
            "primary_framework": "The ideal MECE framework for this case type",
            "key_areas": ["List of main areas to cover"],
            "sub_areas": ["Important sub-areas within each main area"],
            "case_type_specific": "How this framework should be adapted for this specific case type"
        },
        "common_pitfalls": [
            "List of common mistakes to watch for",
            "Typical structural issues",
            "Missing critical areas"
        ],
        "industry_considerations": [
            "Industry-specific factors to consider",
            "Relevant market dynamics",
            "Key industry metrics"
        ],
        "scoring_rubric": {
            "excellent": "What an excellent framework looks like (25 points)",
            "good": "What a good framework looks like (20 points)",
            "average": "What an average framework looks like (15 points)",
            "needs_work": "What a framework that needs work looks like (10 points or less)"
        }
    },
    "quantitative": {
        "expected_calculation": {
            "approach": "The correct calculation approach",
            "key_metrics": ["List of important numbers to calculate"],
            "assumptions": ["Reasonable assumptions to make"],
            "interpretation": "How to interpret the results"
        },
        "common_pitfalls": [
            "Common calculation mistakes",
            "Typical misinterpretations",
            "Missing critical factors"
        ],
        "industry_considerations": [
            "Industry-specific metrics to consider",
            "Relevant benchmarks",
            "Key performance indicators"
        ],
        "scoring_rubric": {
            "excellent": "What excellent quantitative analysis looks like (25 points)",
            "good": "What good quantitative analysis looks like (20 points)",
            "average": "What average quantitative analysis looks like (15 points)",
            "needs_work": "What quantitative analysis that needs work looks like (10 points or less)"
        }
    },
    "qualitative": {
        "expected_analysis": {
            "key_areas": ["Main qualitative areas to analyze"],
            "critical_factors": ["Important factors to consider"],
            "strategic_implications": "How to connect analysis to strategy"
        },
        "common_pitfalls": [
            "Common qualitative analysis mistakes",
            "Typical oversights",
            "Missing strategic connections"
        ],
        "industry_considerations": [
            "Industry-specific qualitative factors",
            "Market dynamics to consider",
            "Competitive landscape elements"
        ],
        "scoring_rubric": {
            "excellent": "What excellent qualitative analysis looks like (25 points)",
            "good": "What good qualitative analysis looks like (20 points)",
            "average": "What average qualitative analysis looks like (15 points)",
            "needs_work": "What qualitative analysis that needs work looks like (10 points or less)"
        }
    },
    "ceo_synthesis": {
        "expected_recommendation": {
            "structure": "How to structure the CEO recommendation",
            "key_points": ["Critical points to include"],
            "action_items": ["Specific actions to recommend"],
            "implementation": "How to address implementation"
        },
        "common_pitfalls": [
            "Common synthesis mistakes",
            "Typical recommendation issues",
            "Missing critical elements"
        ],
        "industry_considerations": [
            "Industry-specific recommendations",
            "Market context for the recommendation",
            "Competitive implications"
        ],
        "scoring_rubric": {
            "excellent": "What an excellent CEO synthesis looks like (25 points)",
            "good": "What a good CEO synthesis looks like (20 points)",
            "average": "What an average CEO synthesis looks like (15 points)",
            "needs_work": "What a CEO synthesis that needs work looks like (10 points or less)"
        }
    }
}

Rules for generating answer keys:
1. Be specific and detailed for each section
2. Consider the case type, industry, and specific scenario
3. Include realistic expectations and common mistakes
4. Provide clear scoring criteria
5. Focus on actionable insights
6. Return ONLY the JSON object, no other text"""

# Update the answer key generation in main.py to use this template
answer_key_prompt = ANSWER_KEY_TEMPLATE

GRADE_PROMPT = """You are a Bain & Company case interviewer evaluating a candidate's performance. Analyze their answers across all stages and provide structured feedback in JSON format only.

Required JSON structure:
{
    \"overall\": <int 0-100>,
    \"breakdown\": {
        \"framework\": <int 0-25>,
        \"quantitative\": <int 0-25>,
        \"qualitative\": <int 0-25>,
        \"ceo_synthesis\": <int 0-25>
    },
    \"detailed_feedback\": {
        \"framework\": {
            \"score\": <int 0-25>,
            \"strengths\": [<list of specific strengths>],
            \"areas_for_improvement\": [<list of specific areas>],
            \"compared_to_answer_key\": \"How their framework compared to the expected structure\",
            \"specific_advice\": [<list of actionable advice>]
        },
        \"quantitative\": {
            \"score\": <int 0-25>,
            \"strengths\": [<list of specific strengths>],
            \"areas_for_improvement\": [<list of specific areas>],
            \"compared_to_answer_key\": \"How their analysis compared to the expected approach\",
            \"specific_advice\": [<list of actionable advice>]
        },
        \"qualitative\": {
            \"score\": <int 0-25>,
            \"strengths\": [<list of specific strengths>],
            \"areas_for_improvement\": [<list of specific areas>],
            \"compared_to_answer_key\": \"How their analysis compared to the expected approach\",
            \"specific_advice\": [<list of actionable advice>]
        },
        \"ceo_synthesis\": {
            \"score\": <int 0-25>,
            \"strengths\": [<list of specific strengths>],
            \"areas_for_improvement\": [<list of specific areas>],
            \"compared_to_answer_key\": \"How their recommendation compared to the expected approach\",
            \"specific_advice\": [<list of actionable advice>]
        }
    },
    \"summary\": {
        \"key_strengths\": [<list of top 2-3 overall strengths>],
        \"key_areas_for_improvement\": [<list of top 2-3 overall areas to improve>],
        \"next_steps\": [<list of 2-3 specific actions to take>]
    }
}

Rules:
1. overall = sum(breakdown.*)
2. Each breakdown score must be ≤ 25
3. Be specific and actionable in feedback
4. Focus on both content and delivery
5. Consider clarity, structure, quantitative skills, and business acumen
6. Return ONLY valid JSON, no other text
7. Compare answers against the provided answer keys
8. Provide specific, actionable advice for improvement
9. Highlight both strengths and areas for improvement
10. Consider industry-specific context

Candidate answers by stage:
{answers}

Answer keys for evaluation:
{answer_keys}

Evaluate based on these criteria:
- Framework: MECE structure, logical flow, and completeness
- Quantitative: Math accuracy, data interpretation, and analytical rigor
- Qualitative: Strategic thinking, practical implications, and industry awareness
- CEO Synthesis: Clarity, actionability, and business impact"""

CONSISTENCY_CHECKS = {
    Stage.INTRO: {
        "required_elements": {
            "case_name": True,  # Must be present
            "company_intro": True,  # Must be present
            "business_situation": True,  # Must be present
            "objective": True,  # Must be present
        },
        "completion_criteria": {
            "min_clarifying_questions": 2,  # Minimum number of clarifying questions to be considered complete
            "max_clarifying_questions": 5,  # Maximum before suggesting moving on
            "key_topics_covered": [
                "company background",
                "market context",
                "specific challenge",
                "clear objective"
            ]
        },
        "transition_guidance": {
            "ready_to_move_on": "The candidate has asked sufficient clarifying questions and demonstrated understanding of the case context",
            "needs_more_time": "The candidate hasn't fully explored key aspects of the case",
            "suggested_prompts": [
                "Would you like to explore any other aspects of the case before we move on?",
                "Do you feel you have enough information to proceed with structuring your approach?",
                "Is there anything else you'd like to clarify about the current situation?"
            ]
        }
    },
    
    Stage.CLARIFY: {
        "required_elements": {
            "questions_answered": True,  # All questions must be addressed
            "key_information_provided": True,  # Essential information must be shared
        },
        "completion_criteria": {
            "min_questions_answered": 2,  # Minimum questions that should be answered
            "key_topics_covered": [
                "market size",
                "competition",
                "timeline",
                "constraints",
                "success_metrics"
            ],
            "understanding_check": "Candidate demonstrates comprehension of provided information"
        },
        "transition_guidance": {
            "ready_to_move_on": "The candidate has received answers to their key questions and shows readiness to structure their approach",
            "needs_more_time": "The candidate still has important unanswered questions",
            "suggested_prompts": [
                "Have all your questions been answered to your satisfaction?",
                "Do you feel you have enough information to begin structuring your approach?",
                "Is there anything else you'd like to clarify before we move on?"
            ]
        }
    },
    
    Stage.FRAMEWORK: {
        "required_elements": {
            "framework_presented": True,  # Candidate must present a framework
            "mECE_structure": True,  # Framework should be MECE
            "case_specific": True,  # Framework should be relevant to the case
        },
        "completion_criteria": {
            "min_framework_elements": 3,  # Minimum number of main framework elements
            "key_topics_covered": [
                "market analysis",
                "financial analysis",
                "implementation considerations",
                "risks and mitigants"
            ],
            "quality_checks": [
                "framework is MECE",
                "framework is case-specific",
                "framework is actionable",
                "framework is comprehensive"
            ]
        },
        "transition_guidance": {
            "ready_to_move_on": "The candidate has presented a solid, MECE framework that addresses the case objectives",
            "needs_more_time": "The framework needs refinement or is missing key elements",
            "suggested_prompts": [
                "Would you like to refine any part of your framework before we move to analysis?",
                "Do you feel your framework covers all the key areas we need to address?",
                "Should we explore any particular area of your framework in more detail?"
            ]
        }
    },
    
    Stage.QUANT: {
        "required_elements": {
            "calculations_presented": True,  # Candidate must show calculations
            "assumptions_stated": True,  # Assumptions must be explicit
            "interpretation_provided": True,  # Results must be interpreted
        },
        "completion_criteria": {
            "min_calculations": 2,  # Minimum number of calculations
            "key_topics_covered": [
                "market size",
                "profitability",
                "break-even analysis",
                "investment returns"
            ],
            "quality_checks": [
                "calculations are accurate",
                "assumptions are reasonable",
                "interpretation is clear",
                "business implications are addressed"
            ]
        },
        "transition_guidance": {
            "ready_to_move_on": "The candidate has completed necessary calculations and provided clear interpretation",
            "needs_more_time": "Calculations are incomplete or interpretation needs work",
            "suggested_prompts": [
                "Have you completed all the calculations you need?",
                "Would you like to explore any other quantitative aspects?",
                "Do you feel you have enough data to move to qualitative analysis?"
            ]
        }
    },
    
    Stage.QUAL: {
        "required_elements": {
            "qualitative_analysis": True,  # Must provide qualitative analysis
            "strategic_implications": True,  # Must discuss strategic implications
            "implementation_considerations": True,  # Must address implementation
        },
        "completion_criteria": {
            "min_qualitative_elements": 3,  # Minimum number of qualitative aspects covered
            "key_topics_covered": [
                "market dynamics",
                "competitive landscape",
                "implementation challenges",
                "risks and mitigants"
            ],
            "quality_checks": [
                "analysis is comprehensive",
                "strategic implications are clear",
                "implementation is feasible",
                "risks are addressed"
            ]
        },
        "transition_guidance": {
            "ready_to_move_on": "The candidate has provided thorough qualitative analysis with clear strategic implications",
            "needs_more_time": "Qualitative analysis needs more depth or strategic implications are unclear",
            "suggested_prompts": [
                "Have you covered all the key qualitative aspects?",
                "Would you like to explore any particular area in more detail?",
                "Do you feel ready to synthesize your findings for the CEO?"
            ]
        }
    },
    
    Stage.CEO_SYNTH: {
        "required_elements": {
            "key_insights": True,  # Must present key insights
            "clear_recommendation": True,  # Must provide clear recommendation
            "action_items": True,  # Must include specific actions
        },
        "completion_criteria": {
            "min_synthesis_elements": 3,  # Minimum number of synthesis elements
            "key_topics_covered": [
                "key findings",
                "clear recommendation",
                "implementation steps",
                "expected outcomes"
            ],
            "quality_checks": [
                "synthesis is concise",
                "recommendation is actionable",
                "implementation is clear",
                "outcomes are specific"
            ]
        },
        "transition_guidance": {
            "ready_to_move_on": "The candidate has provided a clear, actionable recommendation with specific next steps",
            "needs_more_time": "Recommendation needs more clarity or action items are vague",
            "suggested_prompts": [
                "Would you like to refine any part of your recommendation?",
                "Do you feel your action items are specific enough?",
                "Should we explore any particular aspect of the implementation?"
            ]
        }
    }
}

def validate_section_completion(stage: Stage, conversation_history: List[Dict]) -> Dict:
    """
    Validates if a section is complete based on the conversation history and stage requirements.
    Returns a dictionary with validation results and guidance.
    """
    checks = CONSISTENCY_CHECKS[stage]
    validation_result = {
        "is_complete": False,
        "missing_elements": [],
        "suggested_prompts": [],
        "ready_to_transition": False
    }
    
    # Check required elements
    for element, required in checks["required_elements"].items():
        if required and not _check_element_presence(element, conversation_history):
            validation_result["missing_elements"].append(element)
    
    # Check completion criteria
    for topic in checks["completion_criteria"]["key_topics_covered"]:
        if not _check_topic_coverage(topic, conversation_history):
            validation_result["missing_elements"].append(f"topic: {topic}")
    
    # Determine if ready to transition
    validation_result["is_complete"] = len(validation_result["missing_elements"]) == 0
    validation_result["ready_to_transition"] = (
        validation_result["is_complete"] and 
        _check_quality_criteria(checks["completion_criteria"]["quality_checks"], conversation_history)
    )
    
    # Add appropriate guidance
    if validation_result["ready_to_transition"]:
        validation_result["suggested_prompts"] = checks["transition_guidance"]["ready_to_move_on"]
    else:
        validation_result["suggested_prompts"] = checks["transition_guidance"]["suggested_prompts"]
    
    return validation_result

def _check_element_presence(element: str, conversation_history: List[Dict]) -> bool:
    """Helper function to check if a required element is present in the conversation."""
    # Implementation would check conversation history for specific elements
    # This would be customized based on the element type and stage
    pass

def _check_topic_coverage(topic: str, conversation_history: List[Dict]) -> bool:
    """Helper function to check if a topic has been adequately covered."""
    # Implementation would analyze conversation history for topic coverage
    # This would consider both explicit mentions and related discussions
    pass

def _check_quality_criteria(quality_checks: List[str], conversation_history: List[Dict]) -> bool:
    """Helper function to check if quality criteria have been met."""
    # Implementation would evaluate the quality of the discussion
    # This would consider both content and delivery aspects
    pass

# ... rest of the existing code ... 