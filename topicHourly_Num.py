import numpy as np
import pandas as pd
import time
import math
import os
import json


def obatain_Docs_Words_TW(fileDoc, fileWord, fileTW):
    with open(fileDoc) as Doc: # 获得Doc，即DeviceID的列表
        docs = eval(Doc.read())
        
    with open(fileWord) as word: # 获得Word,即时空单元的列表
        words = eval(word.read())
        
    with open(fileTW) as f: # 读取 topic_word.csv 文件夹
        data = f.readlines()
    num_topics = len(data)
    
    temp = []
    for i in range(len(data)):
        temp.append(list(eval(data[i])))
    TW = np.array(temp)
    
    topic_word = TW
    
    for j in range(len(topic_word)): #将主题和词矩阵按行归一化
        twsum = np.sum(topic_word[j])
        topic_word[j] = topic_word[j]/twsum
        
    return docs, words, topic_word


def obtain_twtopSum(num): # 获得每个主题的最相关的前 num 个词
    twtopSum = []
    for i in range(len(topic_word)):
        twtop = []
        tw = topic_word[i]
        index = np.argsort(-tw)
        for j in range(num):
            twtop.append(words[index[j]]) 
        twtopSum.append(twtop)
    return twtopSum

def obtain_TopicsHourly(num): # 获得
    keyAreaMap = {}
    keyArea = []
    for i in range(len(twtopSum)):
        species = 'topic_'+str(i)
        topic = []
        for j in range(len(twtopSum[i])):
            grid = twtopSum[i][j][:-2]
            time = twtopSum[i][j][-2:]
            if len(str(grid)) == 4: # 如果 grid 长度为 4， 则在 grid 前添加 ‘0’，否则添加 ‘00’
                temp = '0'+str(grid)+'_'+str(time)+'_'+"0"
            else:
                temp = '00'+str(grid)+'_'+str(time)+'_'+"0"
            topic.append(temp)
            keyArea.append(temp)
        keyAreaMap[species] = topic  
    keyAreaMap['topic_num'] = 5
    keyAreaMap['term_top_num'] = num
    
    topicsHourly = json.dumps(keyAreaMap)
    KeyAreas = json.dumps(keyArea) 
    
    with open(fileTopics, 'w') as fTopics:
        fTopics.write(str(topicsHourly))
    
    with open(fileKeyAreas, 'w') as fKeyAreas:
        fKeyAreas.write(str(KeyAreas))
    
    return topicsHourly, KeyAreas, keyAreaMap


def obtain_TopicHourlyNum(fileTopicHourlyNum):
    topics = []
    for k, v in keyAreaMap.items():
        topics.append(k)
    topics = topics[:-2]
    
    topicHourlyNum = []
    for k in range(len(topics)):
        timeDict = {}
        tempDict = {}
        tw = keyAreaMap[topics[k]]
        
        for i in range(len(tw)):
            time = tw[i].split('_')[1]
            if time not in timeDict:
                timeDict[time] = []
            timeDict[time].append(tw[i])
            
        temp = []
        for j in range(24):
            if len(str(j)) == 1:
                jj = '0' + str(j)
                if jj in timeDict:
                    temp.append([int(jj),len((timeDict[jj]))])
            else:
                if str(j) in timeDict:
                    temp.append([j, len(timeDict[str(j)])])
        tempDict['articles'] = temp
        tempDict['name'] = str(topics[k])
        topicHourlyNum.append(tempDict)
        
        TopicHourlyNum = json.dumps(topicHourlyNum)
        
        with open(fileTopicHourlyNum,'w') as f:
            f.write(str(TopicHourlyNum))
            
fileDoc = 'docsUpdate.csv'
fileWord = 'wordsUpdate.csv' 
fileTW = 'topic_word.csv'
docs, words, topic_word = obatain_Docs_Words_TW(fileDoc, fileWord, fileTW)
print("len(docs):",len(docs), '\nlen(words):',len(words), "\ntopic_word.shape:", topic_word.shape)

twtopSum = obtain_twtopSum(500)
print("len(twtopSum):", len(twtopSum))


topicsHourly, keyAreas, keyAreaMap = obtain_TopicsHourly(500)
#print((topicsHourly))

fileTopicHourlyNum =  'topicHourNum.json'
obtain_TopicHourlyNum(fileTopicHourlyNum)