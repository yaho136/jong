package com.example.demo.utils;

public class LevelCalculator {

    // 기본 필요 경험치 (1레벨 -> 2레벨 갈 때 필요한 양)
    private static final int BASE_XP = 100;
    // 레벨당 가중치 (레벨이 오를수록 추가로 더 필요한 양)
    private static final int XP_INCREMENT = 62;

    /**
     * 특정 레벨에서 다음 레벨로 가기 위해 필요한 '총 경험치' 계산
     * 공식: 100 + (레벨 - 1) * 62
     * 레벨 1 -> 100
     * 레벨 80 -> 100 + (79 * 62) = 5000
     */
    public static int getRequiredXpForNextLevel(int level) {
        return BASE_XP + (level - 1) * XP_INCREMENT;
    }

}