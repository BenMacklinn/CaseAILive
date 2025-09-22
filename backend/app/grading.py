from dataclasses import dataclass, field
from enum import IntEnum, auto
from typing import Dict, List, Set, Optional, Any
import json
from .prompts import Stage

@dataclass
class ProgressiveScore:
    stage: Stage
    base_score: int
    bonus_points: int = 0
    penalty_points: int = 0
    quality_metrics: Dict[str, float] = field(default_factory=dict)
    transition_quality: float = 0.0
    time_efficiency: float = 0.0
    communication_quality: float = 0.0

@dataclass
class StageGrading:
    required_elements: Dict[str, bool]
    quality_metrics: Dict[str, float]
    bonus_criteria: List[str]
    penalty_criteria: List[str]
    transition_requirements: Dict[str, bool]

STAGE_GRADING_CRITERIA = {
    Stage.INTRO: {
        "base_score": 10,
        "required_elements": {
            "understanding_demonstrated": True,
            "appropriate_questions": True,
            "professional_tone": True
        },
        "quality_metrics": {
            "question_relevance": 0.0,
            "understanding_depth": 0.0,
            "communication_clarity": 0.0
        },
        "bonus_criteria": [
            "exceptional_question_quality",
            "deep_industry_insight",
            "strategic_thinking_demonstrated"
        ],
        "penalty_criteria": [
            "lack_of_engagement",
            "irrelevant_questions",
            "poor_communication"
        ]
    },
    
    Stage.FRAMEWORK: {
        "base_score": 25,
        "required_elements": {
            "mECE_structure": True,
            "min_buckets": 3,
            "case_relevance": True,
            "logical_flow": True
        },
        "quality_metrics": {
            "framework_completeness": 0.0,
            "structure_quality": 0.0,
            "case_specificity": 0.0,
            "innovation_level": 0.0
        },
        "bonus_criteria": [
            "innovative_framework",
            "exceptional_MECE",
            "strong_case_fit"
        ],
        "penalty_criteria": [
            "non_MECE_structure",
            "insufficient_buckets",
            "poor_case_fit"
        ]
    },
    
    Stage.QUANT: {
        "base_score": 25,
        "required_elements": {
            "calculation_accuracy": True,
            "assumptions_stated": True,
            "process_explained": True,
            "interpretation_provided": True
        },
        "quality_metrics": {
            "calculation_accuracy": 0.0,
            "assumption_quality": 0.0,
            "process_clarity": 0.0,
            "interpretation_depth": 0.0
        },
        "bonus_criteria": [
            "efficient_calculation",
            "insightful_interpretation",
            "robust_assumptions"
        ],
        "penalty_criteria": [
            "calculation_errors",
            "missing_assumptions",
            "poor_interpretation"
        ]
    },
    
    Stage.QUAL: {
        "base_score": 25,
        "required_elements": {
            "min_ideas": 3,
            "strategic_thinking": True,
            "implementation_considered": True,
            "risks_addressed": True
        },
        "quality_metrics": {
            "idea_quality": 0.0,
            "strategic_depth": 0.0,
            "practicality": 0.0,
            "innovation_level": 0.0
        },
        "bonus_criteria": [
            "exceptional_insights",
            "innovative_solutions",
            "comprehensive_analysis"
        ],
        "penalty_criteria": [
            "insufficient_ideas",
            "poor_strategic_thinking",
            "unrealistic_solutions"
        ]
    },
    
    Stage.CEO_SYNTH: {
        "base_score": 25,
        "required_elements": {
            "clear_recommendation": True,
            "data_support": True,
            "min_risks": 2,
            "min_mitigations": 2
        },
        "quality_metrics": {
            "recommendation_clarity": 0.0,
            "data_usage": 0.0,
            "risk_coverage": 0.0,
            "actionability": 0.0
        },
        "bonus_criteria": [
            "exceptional_clarity",
            "comprehensive_risk_analysis",
            "highly_actionable"
        ],
        "penalty_criteria": [
            "unclear_recommendation",
            "insufficient_risks",
            "poor_actionability"
        ]
    }
}

async def evaluate_quality_metrics(
    stage: Stage,
    answer: str,
    answer_key: Dict[str, Any],
    context: Dict[str, Any],
    client: Any  # OpenAI client
) -> Dict[str, float]:
    """Evaluate quality metrics for a specific stage."""
    metrics = STAGE_GRADING_CRITERIA[stage]["quality_metrics"].copy()
    
    for metric in metrics:
        evaluation_prompt = f"""Evaluate the following answer for {metric}:
        Answer: {answer}
        Context: {context}
        Answer Key: {answer_key}
        
        Return a score between 0 and 1, where:
        0 = Poor performance
        0.5 = Average performance
        1 = Excellent performance
        
        Consider:
        {STAGE_GRADING_CRITERIA[stage]['quality_metrics'][metric]}
        """
        
        response = await client.chat.completions.create(
            model="gpt-4",
            messages=[
                {"role": "system", "content": "You are a case interview evaluator. Return only a number between 0 and 1."},
                {"role": "user", "content": evaluation_prompt}
            ]
        )
        metrics[metric] = float(response.choices[0].message.content.strip())
    
    return metrics

def calculate_transition_quality(
    current_stage: Stage,
    answers: Dict[Stage, str],
    questions: List[str],
    client: Any  # OpenAI client
) -> float:
    """Calculate how well the candidate transitions between stages."""
    if current_stage == Stage.INTRO:
        return 0.0
        
    prev_stage = Stage(current_stage.value - 1)
    if prev_stage not in answers:
        return 0.0
        
    transition_prompt = f"""Evaluate the transition quality between stages:
    Previous Stage ({prev_stage.name}): {answers[prev_stage]}
    Current Stage ({current_stage.name}): {answers[current_stage]}
    Questions: {questions}
    
    Consider:
    1. Logical flow between stages
    2. Building on previous insights
    3. Maintaining consistency
    4. Appropriate progression
    
    Return a score between 0 and 0.2 (20% bonus max)
    """
    
    response = client.chat.completions.create(
        model="gpt-4",
        messages=[
            {"role": "system", "content": "You are a case interview evaluator. Return only a number between 0 and 0.2."},
            {"role": "user", "content": transition_prompt}
        ]
    )
    return float(response.choices[0].message.content.strip())

async def evaluate_stage(
    stage: Stage,
    answer: str,
    answer_key: Dict[str, Any],
    questions: List[str],
    client: Any  # OpenAI client
) -> ProgressiveScore:
    """Evaluate a single stage's performance."""
    criteria = STAGE_GRADING_CRITERIA[stage]
    
    # Evaluate quality metrics
    quality_metrics = await evaluate_quality_metrics(
        stage=stage,
        answer=answer,
        answer_key=answer_key,
        context={"questions": questions},
        client=client
    )
    
    # Calculate average quality score
    avg_quality = sum(quality_metrics.values()) / len(quality_metrics)
    
    # Evaluate bonus criteria
    bonus_prompt = f"""Evaluate the following answer for bonus points:
    Stage: {stage.name}
    Answer: {answer}
    Answer Key: {answer_key}
    
    Consider these bonus criteria:
    {criteria['bonus_criteria']}
    
    Return a JSON with:
    {{
        "bonus_points": <int>,
        "bonus_reasons": [<list of reasons>]
    }}
    """
    
    bonus_response = await client.chat.completions.create(
        model="gpt-4",
        messages=[
            {"role": "system", "content": "You are a case interview evaluator. Return only valid JSON."},
            {"role": "user", "content": bonus_prompt}
        ]
    )
    bonus_eval = json.loads(bonus_response.choices[0].message.content)
    
    # Evaluate penalty criteria
    penalty_prompt = f"""Evaluate the following answer for penalties:
    Stage: {stage.name}
    Answer: {answer}
    Answer Key: {answer_key}
    
    Consider these penalty criteria:
    {criteria['penalty_criteria']}
    
    Return a JSON with:
    {{
        "penalty_points": <int>,
        "penalty_reasons": [<list of reasons>]
    }}
    """
    
    penalty_response = await client.chat.completions.create(
        model="gpt-4",
        messages=[
            {"role": "system", "content": "You are a case interview evaluator. Return only valid JSON."},
            {"role": "user", "content": penalty_prompt}
        ]
    )
    penalty_eval = json.loads(penalty_response.choices[0].message.content)
    
    return ProgressiveScore(
        stage=stage,
        base_score=criteria["base_score"],
        bonus_points=bonus_eval["bonus_points"],
        penalty_points=penalty_eval["penalty_points"],
        quality_metrics=quality_metrics,
        transition_quality=0.0,  # Will be calculated later
        time_efficiency=0.0,     # Could be implemented with timing data
        communication_quality=quality_metrics.get("communication_clarity", 0.0)
    )

async def calculate_progressive_score(
    session: Any,  # Session object
    client: Any    # OpenAI client
) -> Dict[str, Any]:
    """Calculate progressive score based on stage performance and transitions."""
    scores = {}
    total_score = 0
    stage_weights = {
        Stage.INTRO: 0.05,      # 5%
        Stage.FRAMEWORK: 0.25,  # 25%
        Stage.QUANT: 0.25,      # 25%
        Stage.QUAL: 0.25,       # 25%
        Stage.CEO_SYNTH: 0.20   # 20%
    }
    
    # Evaluate each completed stage
    for stage in Stage:
        if stage in session.answers_received and session.answers_received[stage]:
            # Evaluate stage performance
            stage_score = await evaluate_stage(
                stage=stage,
                answer=session.answers_received[stage],
                answer_key=session.answer_keys.get(stage, {}),
                questions=session.questions_asked,
                client=client
            )
            
            # Calculate transition quality
            transition_score = calculate_transition_quality(
                stage,
                session.answers_received,
                session.questions_asked,
                client
            )
            stage_score.transition_quality = transition_score
            
            # Calculate final stage score
            base_score = stage_score.base_score * (
                sum(stage_score.quality_metrics.values()) / 
                len(stage_score.quality_metrics)
            )
            final_stage_score = (
                (base_score + stage_score.bonus_points - stage_score.penalty_points) *
                stage_weights[stage] *
                (1 + transition_score)
            )
            
            scores[stage.name] = {
                "raw_score": base_score,
                "bonus_points": stage_score.bonus_points,
                "penalty_points": stage_score.penalty_points,
                "transition_score": transition_score,
                "quality_metrics": stage_score.quality_metrics,
                "weighted_score": final_stage_score,
                "feedback": generate_stage_feedback(stage, stage_score)
            }
            
            total_score += final_stage_score
    
    # Generate overall feedback
    feedback = {
        "total_score": total_score,
        "stage_breakdown": scores,
        "strengths": identify_key_strengths(scores),
        "areas_for_improvement": identify_improvement_areas(scores),
        "recommendations": generate_recommendations(scores)
    }
    
    return feedback

def generate_stage_feedback(stage: Stage, score: ProgressiveScore) -> Dict[str, Any]:
    """Generate detailed feedback for a stage."""
    return {
        "score_breakdown": {
            "base_score": score.base_score,
            "bonus_points": score.bonus_points,
            "penalty_points": score.penalty_points,
            "quality_metrics": score.quality_metrics,
            "transition_quality": score.transition_quality
        },
        "strengths": [
            metric for metric, value in score.quality_metrics.items()
            if value >= 0.8
        ],
        "areas_for_improvement": [
            metric for metric, value in score.quality_metrics.items()
            if value < 0.6
        ],
        "specific_feedback": generate_specific_feedback(stage, score)
    }

def identify_key_strengths(scores: Dict[str, Any]) -> List[str]:
    """Identify key strengths across all stages."""
    strengths = []
    for stage, score in scores.items():
        if score["weighted_score"] >= 0.8 * STAGE_GRADING_CRITERIA[Stage[stage]]["base_score"]:
            strengths.append(f"Strong performance in {stage}")
        for metric, value in score["quality_metrics"].items():
            if value >= 0.8:
                strengths.append(f"Excellent {metric} in {stage}")
    return strengths[:3]  # Return top 3 strengths

def identify_improvement_areas(scores: Dict[str, Any]) -> List[str]:
    """Identify areas for improvement across all stages."""
    improvements = []
    for stage, score in scores.items():
        if score["weighted_score"] < 0.6 * STAGE_GRADING_CRITERIA[Stage[stage]]["base_score"]:
            improvements.append(f"Needs improvement in {stage}")
        for metric, value in score["quality_metrics"].items():
            if value < 0.6:
                improvements.append(f"Work on {metric} in {stage}")
    return improvements[:3]  # Return top 3 areas for improvement

def generate_recommendations(scores: Dict[str, Any]) -> List[str]:
    """Generate specific recommendations for improvement."""
    recommendations = []
    for stage, score in scores.items():
        if score["transition_quality"] < 0.1:
            recommendations.append(f"Work on transitioning more smoothly from {stage}")
        for metric, value in score["quality_metrics"].items():
            if value < 0.6:
                recommendations.append(
                    f"Practice {metric} in {stage} to improve overall performance"
                )
    return recommendations[:3]  # Return top 3 recommendations

def generate_specific_feedback(stage: Stage, score: ProgressiveScore) -> str:
    """Generate specific feedback for a stage based on performance."""
    feedback_prompt = f"""Generate specific feedback for a case interview {stage.name} stage:
    Base Score: {score.base_score}
    Bonus Points: {score.bonus_points}
    Penalty Points: {score.penalty_points}
    Quality Metrics: {score.quality_metrics}
    Transition Quality: {score.transition_quality}
    
    Provide 2-3 specific, actionable points of feedback.
    Focus on both strengths and areas for improvement.
    Be professional and constructive.
    """
    
    # Note: This would typically call GPT, but for now return a template
    return f"""Based on your {stage.name} performance:
    - Your base score was {score.base_score} points
    - You earned {score.bonus_points} bonus points
    - You received {score.penalty_points} penalty points
    - Your transition quality was {score.transition_quality:.2f}
    
    Key metrics:
    {json.dumps(score.quality_metrics, indent=2)}
    """ 