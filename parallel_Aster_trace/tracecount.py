#!/usr/bin/python
# -*- coding: utf-8 -*- 

'''在原先traceCount_test_01.py(统计两个grid之间的轨迹条数)基础上，
再增加两个grid之间轨迹的词ID与词频统计功能，用于输入到LDA模型中重新获
得轨迹与topic之间的相关度'''
'''从服务器上下载下来的traceCount_secondLDA_linux_3.py，在此基础上
重新跑数据。因为换了keywords，因此一些表需要重新建。在此基础上加了一些注释和输出提示
该代码有以下功能：建表之后可以
searchTraceNum()  两个grid之间的轨迹流量大小
searchLDAInfo(car_connect) #将keyWords中出现的grid之间的轨迹，统计成LDA的输入文档
searchInfo(car_connect)  #将keyWords中出现的grid之间的轨迹，查询经纬度信息,
由于内存原因，无法一次性将数据读取出，因此分小时读取
'''
import sqlite3
import os, sys
import math
import time
import json

def toLatLngNum(s):
    '''将数字转换为经纬度'''
    return float(s) / pow(10, 7)

def timeTransformStruct(value):
    value = time.localtime(value)
    return value

def timeTransform(value):
    '''ʱ�����ʽת��������Ϊʱ����ַ���'''
    format = '%Y-%m-%d %H:%M:%S'
    # valueΪ�����ֵΪʱ���(����)���磺1332888820
    #value = time.localtime(value)
    
    # ����پ���strftime����ת��Ϊ�������ڸ�ʽ��
    dt = time.strftime(format, value)
    return dt

'''将数字转换为符合条件的字符串 '''
def stringTransform(str,num):
    i=num-len(str)
    if(i>0):
        s='0'*i
        str=s+str
    return str  

#############################################################################################################################################################################################
####                      数据库操作开始
#############################################################################################################################################################################################
def connect(path):
    '''连接数据库'''
    conn=sqlite3.connect(path)
    return conn

def cursor(conn):
    '''获得数据库的游标'''
    curs=conn.cursor()
    return curs

################################################################################################################################################################################################
#                         创建数据库表
#################################################################################################################################################################################################
def create_table_car(conn):
    '''创建数据库表car'''
    print ("create_table_car start")
    create_sql='''
CREATE TABLE car(
  DeviceID         TEXT,
  Longitude        FLOAT,
  Latitude         FLOAT,
  Hour             INT,
  GridIndex        Int,
  Word             TEXT,
  TimeStamp        DATATIME
)
'''
    cu = cursor(conn)
    cu.execute(create_sql)
    conn.commit()
    print ("Table car create success")


def create_table_keyWord(conn):
    '''创建数据库表keyWord,用于存储从keyWord文件中
    读取的需要计数的word信息，提取gridIndex'''
    print ("create_table_keyWord start")
    create_sql='''
CREATE TABLE keyWord(
  Word             TEXT   PRIMARY KEY,
  GridIndex        INT,
  Hour             INT
)
'''
    cu = cursor(conn)
    cu.execute(create_sql)
    conn.commit()
    print ("Table keyWord create success")

def create_table_gridConnectNum(conn):
    '''创建数据库表gridConnectNum,用于存储经过指定grid之间的deviceID'''
    print ("create_table_gridConnectNum start")
    create_sql='''
CREATE TABLE gridConnectNum(
  GridGrid        TEXT,
  DeviceID        TEXT,
  Hour            INT
)
'''
    cu = cursor(conn)
    cu.execute(create_sql)
    conn.commit()
    print ("Table gridConnectNum create success")

def create_table_deviceGrid(conn):
    '''创建数据库表deviceGrid,用于存储经过指定grid的deviceID
    以及其最早经过时间'''
    print ("create_table_deviceGrid start")
    create_sql='''
CREATE TABLE deviceGrid(
  DeviceID         TEXT,
  GridIndex        INT,
  MinTime          TEXT,
  Hour             INT 
)
'''
    cu = cursor(conn)
    cu.execute(create_sql)
    conn.commit()
    print ("Table deviceGrid create success")


def create_table_word(conn):
    '''创建数据库表word，用于存储做lda输入时产生的word以及word对应的ID'''
    print ("create_table_word  start")
    create_sql='''
  CREATE TABLE word(
  Word             TEXT   PRIMARY KEY,
  UNIQUEID         INT       
  
)
'''
    cu = cursor(conn)
    cu.execute(create_sql)
    conn.commit()
    print ("Table word create success  create_table_word() finish")


def create_table_certainTraceInfo(conn):
    '''创建数据库表certainTraceInfo，用于抽取那些确定的grid之间轨迹数据'''
    print ("create_table_certainTraceInfo() start")
    create_sql='''
  CREATE TABLE certainTraceInfo(
  DeviceID         TEXT,
  Longitude        FLOAT,
  Latitude         FLOAT,
  Hour             INT,
  GridIndex        Int,
  Word             TEXT,
  GridGrid         TEXT,
  TimeStamp        DATATIME       
)
'''
    cu = cursor(conn)
    cu.execute(create_sql)
    conn.commit()
    print ("Table word create success  create_table_certainTraceInfo() finish")
#############################################创建视图########################################################################################################  
def create_view_deviceGrid(conn):
    '''创建数据库视图deviceGridAll,用于存储经过指定grid的
    deviceID以及其最早经过时间'''

    print ("create_view_deviceGrid  start")
    create_view_sql='''
        CREATE VIEW deviceGridAll
        AS
        SELECT DeviceID,car.GridIndex,TimeStamp,car.Hour FROM keyWord,car WHERE keyWord.Word=car.Word'''
    curs=cursor(conn)
    curs.execute(create_view_sql)
    
    #create_view_sql_01='''
        #CREATE VIEW deviceGrid
        #AS
        #SELECT DeviceID,GridIndex,MIN(TimeStamp) MinTime,DA.Hour FROM deviceGridAll DA,hour GROUP BY DeviceID,GridIndex,DA.Hour'''
    #curs.execute(create_view_sql_01)
    conn.commit()
    print ("create_view_deviceGrid  finish")



def drop_view_deviceGrid(conn):
    curs=cursor(conn)
    drop_sql='DROP VIEW deviceGridAll'
    #curs.execute(drop_sql)

    drop_sql1='DROP TABLE deviceGrid'
    #curs.execute(drop_sql1)

    drop_sql2='DROP TABLE gridConnectNum'
    #curs.execute(drop_sql2)

    drop_sql3='DROP TABLE certainTraceInfo'
    curs.execute(drop_sql3)
    conn.commit()

#############################################创建索引########################################################################################################  
def create_Index(conn):
    print('create index for table car')
    create_sql1='CREATE INDEX car_DeviceID ON car(DeviceID)'
    create_sql2='CREATE INDEX car_TimeStamp ON car(TimeStamp)'
    create_sql3='CREATE INDEX car_GridIndex ON car(GridIndex)'
    
    cu = cursor(conn)
    cu.execute(create_sql1)
    cu.execute(create_sql2)
    cu.execute(create_sql3)
    conn.commit()  
    print('create index for table car finish')      
################################################################################################################################################################################################
#                         向数据库中插入数据
#################################################################################################################################################################################################
def insert_car(conn,filepath):
    print("Insert data into table car   insert_car()")
    '''向表car中插入数据'''
    curs=cursor(conn)
    insert_sql='INSERT INTO car VALUES(?,?,?,?,?,?,?)'
    wordID=0
    f = open(filepath, 'r')    
    for line in f.readlines():
        points = []
        words=[]
        DataTime, UNIQUEID, DeviceType, Company, DeviceID, Flag, FilterFlag, EvelationFlag, Satellite, \
        Heading, Speed, EvelationUnit, Evelation, Status, Event, Longitude, Latitude, BJLongitude, \
        BJLatitude, TimeStamp = line.strip().split(',')

        Longitude=toLatLngNum(Longitude)
        '''纬度'''
        Latitude=toLatLngNum(Latitude)
        '''经度'''
        TimeStampStruct=timeTransformStruct(int(TimeStamp))
        '''小时'''
        #Hour=int(math.floor(TimeStampStruct.tm_hour/2))
        Hour=TimeStampStruct.tm_hour
        #print Hour
        TimeStamp=timeTransform(TimeStampStruct)

        '''将超出划定范围的点去掉 '''
        if(DeviceID!=''):
            if(left<Longitude and Longitude<right and bottom<Latitude and Latitude<up):
                row=(Longitude-left)/wideDistance
                column=(Latitude-bottom)/heightDistance
                GridIndex=int(math.floor(column)*blockCount+math.floor(row))
                '''是否为节假日，0为工作日，1为节假日 '''
                Holiday=1
                '''word由Gridindex(5位)、Hour(2位)、Holiday(2位)组成 '''
                Word=stringTransform(str(GridIndex),5)+'_'+stringTransform(str(Hour),2)+'_'+str(Holiday)
                point=[DeviceID,Longitude,Latitude,Hour,GridIndex, Word, TimeStamp]
                curs.execute(insert_sql,point)

    conn.commit()
    print("Insert data finish")
 

def insert_keyWord(conn,keyfile):
    print("Insert data into table keyWord   insert_keyWord()")
    '''向表keyWord中插入数据 '''
    curs=cursor(conn)
    insert_sql='INSERT INTO keyWord VALUES(?,?,?)' 
    f = open(keyfile, 'r')
    for line in f.readlines():
        word=line.strip().split(":")[0]
        GridIndex=int(word.strip().split("_")[0])
        Hour=int(word.strip().split("_")[1])
        point=[word,GridIndex,Hour]
        curs.execute(insert_sql,point)
    conn.commit()
    print("Insert data insert_keyWord() finish")

def insert_deviceGrid(conn):
    print("Insert data into table deviceGrid  insert_deviceGrid()")
    curs=cursor(conn)
    '''向表deviceGrid中插入数据,每条轨迹经过该grid的时间都是按每小时计算的 '''
    insert_sql='INSERT INTO deviceGrid VALUES(?,?,?,?)'
    for i in range(24):
        print ("deviceGrid:"+str(i))
        search_sql1="SELECT DeviceID,GridIndex,MIN(TimeStamp) MinTime,Hour FROM deviceGridAll WHERE Hour=%d GROUP BY DeviceID,GridIndex" %i
        curs.execute(search_sql1)
        for row in curs.fetchall():
            point=row[:]
            curs.execute(insert_sql,point)

    conn.commit()
    print("insert_deviceGrid()  finish")

def insert_gridConnectNum(conn):
    print("Insert data into table gridConnectNum   insert_gridConnectNum()")
    '''向表gridConnectNum中插入数据，统计数据按照每小时计算 '''
    curs=cursor(conn)
    insert_sql='INSERT INTO gridConnectNum VALUES(?,?,?)'

    request=' A.Hour=B.Hour AND A.MinTime<B.MinTime GROUP BY A.DeviceID,A.GridIndex,B.GridIndex,A.Hour'
    search_sql1="SELECT A.DeviceID,A.GridIndex,B.GridIndex,A.Hour FROM deviceGrid A,deviceGrid B WHERE A.DeviceID=B.DeviceID AND %s" %request
    curs.execute(search_sql1)
    for row in curs.fetchall():
        gridA=row[1]
        gridB=row[2]
        hour=row[3]
        gridgrid=stringTransform(str(gridA),4)+"_"+stringTransform(str(gridB),4)+"_"+stringTransform(str(hour),2)
        point=[gridgrid,row[0],row[3]]
        curs.execute(insert_sql,point)
    conn.commit()
    print("insert_gridConnectNum()  finish")

def insert_certainTraceInfo(conn):
    print("Insert data into table certainTraceInfo")
    '''向表certainTraceInfo中插入数据，将几个固定的grid之间的轨迹按照小时抽取出来 '''
    curs=cursor(conn)
    insert_sql='INSERT INTO certainTraceInfo VALUES(?,?,?,?,?,?,?,?)' 
    request="WHERE c.DeviceID=gcn.DeviceID AND c.Hour=gcn.Hour ORDER BY gcn.DeviceID,gcn.Hour"
    search_sql1="SELECT c.DeviceID,c.Longitude,c.Latitude,c.Hour,c.GridIndex,c.Word,gcn.GridGrid,c.TimeStamp FROM car c,gridConnectNum gcn %s" % request
    curs.execute(search_sql1)
    for row in curs.fetchall():
        point=row
        curs.execute(insert_sql,point)

    conn.commit()


#############################################数据库插入操作结束########################################################################################################

################################################################################################################################################################################################
#                                            从数据库中查询数据
#################################################################################################################################################################################################
def searchTraceNum(conn,tnfile):
    print("Search trace num   searchTraceNum() start")
    carInformation=[]
    carConnect={}
    curs=cursor(conn)
    #search_sql1="SELECT DeviceID,GridIndex,MIN(TimeStamp) FROM car WHERE GridIndex=6152"
    #search_sql1="SELECT * FROM deviceGrid"
    
    #search_sql1="SELECT DeviceID,car.GridIndex, TimeStamp FROM keyWord,car WHERE car.GridIndex IN %s" % request
    #search_sql1="SELECT DeviceID,car.GridIndex,TimeStamp FROM keyWord,car WHERE car.GridIndex=keyWord.GridIndex"
    #request='A.MinTime<B.MinTime GROUP BY A.DeviceID,A.GridIndex,B.GridIndex'
    #search_sql1="SELECT A.DeviceID,A.GridIndex,B.GridIndex FROM deviceGrid A,deviceGrid B,keyWord WHERE A.DeviceID=B.DeviceID AND %s" %request
    #search_sql1="SELECT * FROM gridConnectNum"
    search_sql1="SELECT GridGrid, COUNT(DeviceID) FROM gridConnectNum GROUP BY GridGrid"
    curs.execute(search_sql1)
    for row in curs.fetchall():
        carInformation.append(row)

    #dumpF=open('allData_result_traceNum_02.json','w')  #tnfile
    dumpF=open(tnfile,'w')
    json.dump(carInformation, dumpF)
    dumpF.close() 
    print(" searchTraceNum() finish")



def searchPassTrace(conn):
    '''查询某两个固定的grid之间的具体轨迹信息 '''
    print("Search data")
    carInformation=[]
    carConnect={}
    curs=cursor(conn)
    
    search_sql1="SELECT c.DeviceID,c.Latitude,c.Longitude FROM gridConnectNum gcn,car c WHERE c.DeviceID=gcn.DeviceID AND gcn.GridGrid='6256_6356_01' AND gcn.Hour=1 AND c.Hour=1 " 
   
    curs.execute(search_sql1)
    carWordCount=[]
    car_dict={}

    for row in curs.fetchall():
        if car_dict.has_key(row[0]):
            car_dict[row[0]].append(row[1:])
        else:            
            carInfo=[]
            carInfo.append(row[1:])
            car_dict[row[0]]=carInfo

    dumpF=open('02_test_result_traceLocation.json','w')
    json.dump(car_dict, dumpF,indent=1)
    dumpF.close()
    '''for row in curs.fetchall():
        carInformation.append(row)

    dumpF=open('02_test_result_trace.json','w')
    json.dump(carInformation, dumpF, indent=2)
    dumpF.close() '''

#############################################数据库查询操作结束########################################################################################################    
def close(conn):
    conn.close()

##########################################################实现新功能新加函数#################################################
def insert_wordData(conn,wordFile):
    #向新建的word表中，根据原先的word.txt插入数据
    print("insert_wordData start")
    curs=cursor(conn)
    insert_sql='INSERT INTO word VALUES(?,?)' 
    f = open(wordFile, 'r')
    wordId=0
    for line in f.readlines():
        word=line.strip()
        words=[word,wordId]
        curs.execute(insert_sql,words)
        wordId=wordId+1

    conn.commit()
    curs=cursor(conn)
    print("Insert data into table word   insert_wordData() finish")

def create_view_certainTraceInfo(conn):
    print("create view and insert data   create_view_certainTraceInfo() start")
    create_view_sql='''
        CREATE VIEW certainTraceInfo
        AS
        SELECT c.DeviceID,c.Longitude,c.Latitude,c.Hour,c.GridIndex,c.Word,gcn.GridGrid,c.TimeStamp FROM car c,gridConnectNum gcn 
        WHERE c.DeviceID=gcn.DeviceID AND c.Hour=gcn.Hour ORDER BY gcn.DeviceID,gcn.Hour'''
    curs=cursor(conn)
    curs.execute(create_view_sql)
    conn.commit()
    print("create_view_certainTraceInfo() finish")

def searchLDAInfo(conn,traceDocFile):
    '''将keyWords中出现的grid之间的轨迹，统计成LDA的输入文档 '''
    print("searchLDAInfo() start")
    carWordCount=[]
    flag=0
    #docFile=open('traceDocBuild_allData.dat','w')
    docFile=open(traceDocFile,'w')
    curs=cursor(conn)
    search_sql1="SELECT GridGrid,DeviceID,COUNT(DISTINCT Word) FROM certainTraceInfo GROUP BY GridGrid, DeviceID"
    curs.execute(search_sql1)
    for row in curs.fetchall():
        wordCount=[row[0],row[1],int(row[2])]
        carWordCount.append(wordCount)
    #print carWordCount
    search_sql2="SELECT word.UNIQUEID, COUNT(cti.Word) FROM word,certainTraceInfo cti WHERE word.Word=cti.Word GROUP BY  cti.GridGrid, cti.DeviceID,cti.Word"
    curs.execute(search_sql2)
    carInformation=curs.fetchall()
    for i in carWordCount:
        comDoc=str(i[0])+' '+str(i[1])+' '+str(i[2])
        latter=flag+i[2]
        row=carInformation[flag:latter]
        for j in range(i[2]):
            wordID=str(row[j][0])
            wordCount=str(row[j][1])
            comDoc=comDoc+' '+wordID+':'+wordCount
        flag=latter
        docFile.writelines(comDoc)
        docFile.write('\n')
    docFile.close()
    print("searchLDAInfo() finish")

def searchTraceLocationInfo(conn):
    '''将keyWords中出现的grid之间的轨迹，输出各条轨迹的经纬度信息，用于显示在地图上 '''
    curs=cursor(conn)
    docFile=open('gridTraceLocation_16.dat','w')
    search_sql1="SELECT GridGrid,DeviceID,Longitude,Latitude FROM certainTraceInfo WHERE Hour=16"
    curs.execute(search_sql1)
    for row in curs.fetchall():
        comDoc=row[0]+" "+row[1]+" "+str(row[2])+" "+str(row[3])
        docFile.writelines(comDoc)
        docFile.write('\n')
    docFile.close()

def searchTraceLocationInfo1(conn,h):
    '''将keyWords中出现的grid之间的轨迹，输出各条轨迹的经纬度信息，用于显示在地图上 '''
    print ('print hour '+ str(h))
    hourInfo=int(h)
    curs=cursor(conn)
    hour=stringTransform(str(h),2)
    fileName='./newDataResult/gridTraceLocation_'+hour+'.dat'
    docFile=open(fileName,'w')
    search_sql1="SELECT GridGrid,DeviceID,Longitude,Latitude FROM certainTraceInfo WHERE Hour=%u" %hourInfo
    curs.execute(search_sql1)
    for row in curs.fetchall():
        comDoc=row[0]+" "+row[1]+" "+str(row[2])+" "+str(row[3])
        docFile.writelines(comDoc)
        docFile.write('\n')
    docFile.close()
    
def searchInfo(conn):
    print("searchInfo() start")
    for i in range(0,24):
        searchTraceLocationInfo1(conn,i)
    print("searchInfo() finish")
    

#############################################################################################################################################################################################
####                                         数据库操作结束
#############################################################################################################################################################################################
        
def car(path,filepath,keyfile,tnfile,wordFile,traceDocFile):
    car_connect=connect(path)
    car_cursor=cursor(car_connect)
    '''创建数据库表car'''
    create_table_car(car_connect)   #用于存储原始的信息
    create_table_keyWord(car_connect)   #用于存储从keyWord文件中读取的需要计数的word信息，提取gridIndex
    create_table_deviceGrid(car_connect)     #用于存储经过指定(从keyword表中读取的)grid的deviceID以及其最早经过时间
    create_table_gridConnectNum(car_connect) #用于存储经过指定(从keyword表中读取的)grid之间的deviceID
    

    '''向数据库中插入数据'''
    insert_car(car_connect,filepath)
    insert_keyWord(car_connect,keyfile)

    '''为数据库建立索引 '''
    create_Index(car_connect)
    
    '''建立视图 '''
    create_view_deviceGrid(car_connect)  #用于存储经过指定(从keyword表中读取的)grid的deviceID以及其最早经过时间

    insert_deviceGrid(car_connect)  #向表deviceGrid中插入数据,每条轨迹经过该grid的时间都是按每小时计算的
    insert_gridConnectNum(car_connect)
	

    '''删除视图 '''
    ###drop_view_deviceGrid(car_connect)   #删除一些没有用的表，(基本用不到)
    
    '''搜索数据 '''
    searchTraceNum(car_connect,tnfile)  #两个grid之间的轨迹流量大小
    ###searchPassTrace(car_connect) #两个固定grid之间经过的轨迹详情，包括经纬度(已不采用)

    '''#################################下面是为了实现新功能添加的新函数 ##################################'''
    '''建表 '''
    create_table_word(car_connect) #存储当初生成lda的word表
    ###create_table_certainTraceInfo(car_connect)  #用于抽取那些确定的grid之间轨迹数据插入数据会导致内存占用太多的问题，又与后面的视图冲突(因此不采用)
    
    '''插入数据 '''
    
    insert_wordData(car_connect,wordFile)
    insert_certainTraceInfo(car_connect)  #会导致内存占用太多的问题，(因此不采用)
    create_view_certainTraceInfo(car_connect) #由于内存占用太多，需要创建视图
    #create_table_certainTraceInfo()与insert_certainTraceInfo()合起来效果与create_view_certainTraceInfo()一样
    '''搜索数据 '''
    searchLDAInfo(car_connect,traceDocFile) #将keyWords中出现的grid之间的轨迹，统计成LDA的输入文档
    searchInfo(car_connect)  #将keyWords中出现的grid之间的轨迹，查询经纬度信息,由于内存原因，无法一次性将数据读取出，因此分小时读取
    searchTraceLocationInfo(car_connect) #将keyWords中出现的grid之间的轨迹，查询经纬度信息(这里的代码不够自动，因此不需要)

    close(car_connect)

if __name__=='__main__':
    start=time.clock()
    global path
    '''创建数据库'''
    path="new_car_database_traceNum_alldata.db"   #car_database_traceNum_alldata.db(原先的数据库) 这里为了避免麻烦，直接换了数据库
    '''输入数据文件'''
    filepath='./documentBuild_direction_word2Vector/allData' #原始的交通数据  输入文件
    keyfile='./keyWordData/keyWord_result_2.txt' #经过归一化的keyWords,1100到1200 输入文件
    
    wordFile='./keyWordData/wordNew.txt'  #lda的word文件  输入文件

    tnfile='./newDataResult/allData_traceNum.json'  #交通流量的输出结果文件
    traceDocFile='./newDataResult/traceDocBuild_allData.dat'  #keyWords中出现的grid之间的轨迹，统计成LDA的输入文档,所得的输出结果文件

    global bottom,up,left,right,wideDistance,heightDistance,blockCount
    bottom=30.012  #���ݷ�Χ���γ��
    up=30.4439      #���ݷ�Χ���γ��
    left=119.8691   #���ݷ�Χ���óﾾﾭﾶ�
    right=120.461  #���ݷ�Χ���Ҿ���
    blockCount=100
    wideRange=right-left;
    heightRange=up-bottom;
    wideDistance=wideRange/blockCount;
    heightDistance=heightRange/blockCount;

    global carDeviceID
    #carDeviceID=[] #��¼���ݿ������е�DISTINCT DeviceID���Դ���ѭ����ѯ
    car(path,filepath,keyfile,tnfile,wordFile,traceDocFile)
    end=time.clock()
    print ("The running time is :"+str(end-start))